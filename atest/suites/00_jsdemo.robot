*** Settings ***
Documentation       Verify the webpack-built demo

Resource            ../resources/urljsf.resource
Library             SeleniumLibrary

Suite Setup         Setup Urljsf Suite    00_jsdemo.robot
Test Setup          Open Page    _static/urljsf/demo/index.html
Test Teardown       Open Blank


*** Test Cases ***
JS Demo Opens
    [Documentation]    Verify the JS demo opens.
    Wait Until Element Is Visible    css:${CSS_U_FORM}
    Capture Element Screenshot    css:${CSS_U_FORM}    00-open.png
