*** Settings ***
Documentation       Verify the `xkcd` demo.

Resource            ../../resources/urljsf.resource
Library             SeleniumLibrary

Suite Setup         Setup Urljsf Suite    01_docs/000_xkcd
Test Setup          Open Demo    xkcd
Test Teardown       Open Blank


*** Test Cases ***
Xkcd Demo Opens
    Wait Until Element Is Visible    ${CSS_U_FORM}
    Capture Element Screenshot    ${CSS_U_FORM}    00-open.png
