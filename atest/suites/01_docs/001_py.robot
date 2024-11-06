*** Settings ***
Documentation       Verify the `py` demo.

Resource            ../../resources/urljsf.resource
Library             SeleniumLibrary

Suite Setup         Setup Urljsf Suite    01_docs/001_py
Test Setup          Open Demo    py
Test Teardown       Open Blank


*** Test Cases ***
Py Demo Opens
    [Documentation]    Verify the simple use of `py:` works
    Wait Until Element Is Visible    css:${CSS_U_FORM}
    Capture Element Screenshot    css:${CSS_U_FORM}    00-open.png
