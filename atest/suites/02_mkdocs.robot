*** Settings ***
Documentation       Verify the `xkcd` demo works as built by mkdocs.

Resource            ../resources/xkcd.resource

Suite Setup         Setup Urljsf Suite    02_mkdocs
Test Setup          Open Mkdocs Page    deeply/nested
Test Teardown       Open Blank

Test Tags           app:mkdocs


*** Test Cases ***
Mkdocs XKCD Demo Works
    [Documentation]    Verify the mkdocs `xkcd` opens.
    [Tags]    demo:xkcd
    Exercise XKCD Demo
