*** Settings ***
Documentation       Server keywords for urljsf

Library             Process
Library             ../libraries/server.py
Resource            ./env.resource


*** Keywords ***
Start Server
    [Documentation]    Start an HTTP server.
    ${port} =    Get Unused Port
    ${server} =    Start Process
    ...    python    ${SERVER_PY}    ${port}    ${DOCS}    ${STATIC_ASSETS}    ${DIST_COV}
    ...    stdout=${OUTPUT_DIR}${/}http.log
    ...    stderr=STDOUT
    Set Suite Variable    ${HTTP_PORT}    ${port}    children=${TRUE}
    Set Suite Variable    ${HTTP_SERVER}    ${server}    children=${TRUE}
    Set Suite Variable    ${HTTP_URL}    http://127.0.0.1:${port}    children=${TRUE}
