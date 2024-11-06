*** Settings ***
Documentation       Acceptance tests for urlsjf

Resource            ../resources/urljsf.resource
Library             SeleniumLibrary

Suite Setup         Setup Urljsf Suite    00_jsdemo.robot
Test Setup          Open Page    _static/urljsf/demo/index.html
Test Teardown       Open Blank


*** Test Cases ***
JS Demo Opens
    Wait Until Element Is Visible    ${CSS_U_FORM}
    Capture Element Screenshot    ${CSS_U_FORM}    00-open.png
