*** Settings ***
Documentation       Verify the `installer` demo.

Resource            ../../resources/urljsf.resource
Library             SeleniumLibrary

Suite Setup         Setup Urljsf Suite    01_docs/002_installer
Test Setup          Open Demo    installer
Test Teardown       Open Blank


*** Test Cases ***
Installer Demo Opens
    Wait Until Element Is Visible    ${CSS_U_FORM}    timeout=${TIMEOUT_LONG}
    Capture Page Screenshot    00-open.png
