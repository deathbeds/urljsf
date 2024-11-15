*** Settings ***
Documentation       Verify the `xkcd` demo.

Resource            ../../resources/xkcd.resource

Suite Setup         Setup Urljsf Suite    01_docs/000_xkcd
Test Setup          Open Sphinx Demo    xkcd
Test Teardown       Open Blank

Test Tags           demo:xkcd


*** Test Cases ***
Xkcd Demo Opens
    [Documentation]    Verify the docs `xkcd` opens.
    Exercise XKCD Demo
