*** Settings ***
Documentation       Verify the webpack-built demo

Resource            ../resources/urljsf.resource
Library             SeleniumLibrary

Suite Setup         Setup Urljsf Suite    00_jsdemo.robot
Test Setup          Open Page    _static/urljsf/demo/index.html
Test Teardown       Open Blank


*** Variables ***
${SLIDER_ID}    urljsf-0-url_xkcd


*** Test Cases ***
JS Demo Opens
    [Documentation]    Verify the JS demo opens.
    Wait Until Element Is Visible    css:${CSS_U_FORM}
    Capture Element Screenshot    css:${CSS_U_FORM}    00-open.png
    ${n} =    Verify XKCD Value Changes
    Capture Element Screenshot    css:${CSS_U_FORM}    01-changed.png
    Verify XKCD URL    ${n}


*** Keywords ***
Verify XKCD Value Changes
    [Documentation]    Verify the slider changes.
    ${old} =    Get XKCD Number
    Change XKCD
    ${new} =    Get XKCD Number
    Should Not Be Equal    ${old}    ${new}
    RETURN    ${new}

Change XKCD
    [Documentation]    Change a slider value
    Press Keys    css:#${SLIDER_ID}    RIGHT    RIGHT

Get XKCD Number
    [Documentation]    Get a slider value.
    ${xkcd} =    Get Element Attribute    css:#${SLIDER_ID}    value
    RETURN    ${xkcd}

Get XKCD URL
    [Documentation]    Get the submit value.
    ${url} =    Get Element Attribute    css:${CSS_U_SUBMIT}    href
    RETURN    ${url}

Verify XKCD URL
    [Documentation]    Verify the URL against an expected value.
    [Arguments]    ${n}
    ${url} =    Get Element Attribute    css:${CSS_U_SUBMIT}    href
    Should Be Equal As Strings    ${url}    https://xkcd.com/${n}
