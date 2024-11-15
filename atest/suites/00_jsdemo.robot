*** Settings ***
Documentation       Verify the webpack-built demo

Resource            ../resources/xkcd.resource

Suite Setup         Setup Urljsf Suite    00_jsdemo.robot
Test Setup          Open Page    _static/urljsf/demo/index.html
Test Teardown       Open Blank

Test Tags           app:script


*** Test Cases ***
JS XKCD Demo Works
    [Documentation]    Verify the JS demo as built by webpack opens.
    [Tags]    demo:xkcd
    Exercise XKCD Demo
