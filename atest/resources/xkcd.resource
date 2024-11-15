*** Settings ***
Documentation       XKCD demo keywords

Resource            ../resources/urljsf.resource
Library             SeleniumLibrary


*** Variables ***
${SLIDER_ID}    urljsf-0-url_xkcd


*** Keywords ***
Exercise XKCD Demo
    [Documentation]    Run through the basic steps of the XKCD demo
    Wait Until Element Is Visible    css:${CSS_U_FORM}
    Capture Element Screenshot    css:${CSS_U_FORM}    00-open.png
    ${n} =    Verify XKCD Value Changes
    Capture Element Screenshot    css:${CSS_U_FORM}    01-changed.png
    Verify XKCD URL    ${n}

Verify XKCD Value Changes
    [Documentation]    Verify the slider changes.
    ${old} =    Get XKCD Number
    Change XKCD
    ${new} =    Get XKCD Number
    Should Not Be Equal    ${old}    ${new}
    RETURN    ${new}

Change XKCD
    [Documentation]    Change a slider value
    Click Element    css:#${SLIDER_ID}
    Click Element At Coordinates    css:#${SLIDER_ID}    -100    0

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
    ${expect} =    Set Variable    https://xkcd.com/${n}
    ${url} =    Get Element Attribute    css:${CSS_U_SUBMIT}    href
    Capture Element Screenshot    css:${CSS_U_FORM}    02-slid.png
    Should Be Equal As Strings    ${url}    ${expect}
