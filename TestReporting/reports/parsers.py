def normalize_status(status):
    normalized = str(status or '').strip().upper()

    if normalized in {'PASS', 'PASSED', 'SUCCESS', 'SUCCESSFUL'}:
        return 'Passed'

    if normalized in {'FAIL', 'FAILED', 'ERROR', 'ERRORED'}:
        return 'Failed'

    if normalized in {'SKIP', 'SKIPPED'}:
        return 'Skipped'

    return 'Not Executed'


def collect_test_cases(node, cases=None):
    if cases is None:
        cases = []

    if not isinstance(node, dict):
        return cases

    if node.get('metadata', {}).get('cb_testcase_id') or node.get('parameters') or node.get('stages'):
        cases.append(node)

    for child in node.get('children') or []:
        collect_test_cases(child, cases)

    return cases


def flatten_stages(stages, group_name=''):
    rows = []

    for index, stage in enumerate(stages or []):
        current_group = f'{group_name} / {stage.get("name", "Stage")}' if group_name else stage.get('name', 'Stage')

        if stage.get('type') or stage.get('message') or stage.get('expected_result') or stage.get('actual_result'):
            rows.append(
                {
                    'id': f'{current_group}-{stage.get("timestamp") or stage.get("name") or index}',
                    'group': group_name or 'Execution',
                    'name': stage.get('name') or current_group,
                    'status': normalize_status(stage.get('result') or stage.get('status')),
                    'message': stage.get('message') or '',
                    'expectedResult': stage.get('expected_result') or '',
                    'actualResult': stage.get('actual_result') or '',
                    'type': stage.get('type') or 'STAGE',
                }
            )

        rows.extend(flatten_stages(stage.get('stages') or [], current_group))

    return rows


def compact_parameters(parameters):
    priority_keys = ['__custom_name__', 'target_partition', 'partition_port', 'dut_ip', 'vlan_id', 'channel_name']
    values = []
    seen = set()

    for key in priority_keys:
        if key in parameters:
            values.append((key, parameters[key]))
            seen.add(key)

    for key, value in parameters.items():
        if key not in seen and value not in (None, ''):
            values.append((key, value))

        if len(values) >= 10:
            break

    return '\n'.join(f'{key}: {value}' for key, value in values)


def parse_report_payload(payload, source_filename):
    suites = payload.get('testsuite') if isinstance(payload, dict) else []
    test_cases = []

    for suite in suites or []:
        test_cases.extend(collect_test_cases(suite))

    rows = []

    for index, test_case in enumerate(test_cases):
        metadata = test_case.get('metadata') or {}
        steps = flatten_stages(test_case.get('stages') or [])
        summary = '\n'.join(test_case.get('summary') or [])
        first_failing_step = next((step for step in steps if step['status'] == 'Failed'), None)
        first_step = next((step for step in steps if step['type'] == 'STEP'), steps[0] if steps else None)
        first_expected_step = next((step for step in steps if step['expectedResult']), None)
        first_actual_step = next((step for step in steps if step['actualResult']), None)

        rows.append(
            {
                'id': f'{source_filename}-{metadata.get("cb_testcase_id") or test_case.get("name") or index}-{index}',
                'sourceFilename': source_filename,
                'testcaseId': metadata.get('cb_testcase_id') or metadata.get('tc_id') or 'N/A',
                'testcaseName': test_case.get('name') or metadata.get('tc_id') or 'Unnamed testcase',
                'parameters': compact_parameters(test_case.get('parameters') or {}),
                'parametersRaw': test_case.get('parameters') or {},
                'status': normalize_status(test_case.get('result') or test_case.get('status')),
                'description': metadata.get('description')
                or test_case.get('details')
                or summary
                or (first_failing_step or {}).get('message', ''),
                'message': test_case.get('details') or summary or (first_failing_step or {}).get('message', ''),
                'testStepDescription': (first_step or {}).get('message', ''),
                'testStepStatus': (first_step or {}).get('status', 'Not Executed'),
                'expectedResult': (first_failing_step or first_expected_step or {}).get('expectedResult', ''),
                'actualResult': (first_failing_step or first_actual_step or {}).get('actualResult', ''),
                'steps': steps,
                'testerConclusion': '',
                'analysisStatus': 'Not Started',
            }
        )

    return rows
