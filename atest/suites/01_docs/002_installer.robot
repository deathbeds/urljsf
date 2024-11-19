*** Settings ***
Documentation       Verify the `installer` demo.

Resource            ../../resources/rjsf.resource
Resource            ../../resources/urljsf.resource
Library             Collections
Library             OperatingSystem
Library             SeleniumLibrary
Library             urllib.parse

Suite Setup         Setup Urljsf Suite    01_docs/002_installer
Test Setup          Open Sphinx Demo    installer
Test Teardown       Open Blank

Test Tags           demo:installer


*** Variables ***
${CSS_LICENSE}          ${CSS_U_DATALIST} input[id$="_license"]
${CSS_LICENSE_CHECK}    ${CSS_U_DATALIST} input[id$="_license__datalist-check"]
${GOOD_LICENSE}         BSD-3-Clause
${BAD_LICENSE}          WTPL
${CSS_COPY_BUTTON}      .urljsf-copybutton


*** Test Cases ***
Create An Installer Pixi Project
    [Documentation]    Verify the installer demo works.
    Capture Page Screenshot    00-open.png
    Try Licenses
    Make And Fix An Error
    Verify Installer URL
    Verify Installer Download


*** Keywords ***
Try Licenses
    [Documentation]    Exercise the license list
    Scroll To    ${CSS_LICENSE_CHECK}
    Mouse Over    css:${CSS_LICENSE}
    Input Text    css:${CSS_LICENSE}    ${BAD_LICENSE}
    Checkbox Should Not Be Selected    css:${CSS_LICENSE_CHECK}
    Input Text    css:${CSS_LICENSE}    ${GOOD_LICENSE}
    Checkbox Should Be Selected    css:${CSS_LICENSE_CHECK}

Make And Fix An Error
    [Documentation]    Exercise a complex operation with the packages array
    Element Should Not Contain    css:${CSS_U_SUBMIT}    Error
    ${add} =    Set Variable    ${CSS_R_ARRAY_ITEM_ADD}\[title="dependencies"]
    Scroll To    ${add}
    Click Element    css:${add}
    ${p2} =    Set Variable    input#urljsf-0-pixi_dependencies_1_package
    Wait Until Page Contains    must have required property 'package'
    Scroll To    ${CSS_U_SUBMIT}
    Element Should Contain    css:${CSS_U_SUBMIT}    1 Error
    Click Element    css:${CSS_U_SUBMIT}
    Input Text    css:${p2}    python
    Wait Until Page Contains    2 dependencies have the name
    Element Should Contain    css:${CSS_U_SUBMIT}    1 Error
    Input Text    css:${p2}    urljsf
    Element Should Not Contain    css:${CSS_U_SUBMIT}    Error

Verify Installer URL
    [Documentation]    Verify the URL against an expected value.
    ${url} =    Get Element Attribute    css:${CSS_U_SUBMIT}    href
    ${raw} =    Unquote    ${url.split(",", 1)[1]}
    ${from_toml} =    TOML.Loads    ${raw}
    ${expected} =    Get TOML Fixture    002_installer.toml
    Should Be JSON Equivalent    ${from_toml}    ${expected}
    ${copy} =    Set Variable    css:${CSS_COPY_BUTTON}
    Click Element    ${copy}
    Wait Until Element Contains    ${copy}    ok
    Wait Until Element Contains    ${copy}    copy

Verify Installer Download
    [Documentation]    Verify downloaded file
    ${pt} =    Set Variable    ${DOWNLOADS}${/}pixi.toml
    File Should Not Exist    ${pt}
    Click Element    css:${CSS_U_SUBMIT}
    Wait Until Created    ${pt}
    Sleep    0.1s
    ${raw} =    Get File    ${pt}
    ${from_toml} =    TOML.Loads    ${raw}
    ${expected} =    Get TOML Fixture    002_installer.toml
    Should Be JSON Equivalent    ${from_toml}    ${expected}    Downloaded TOML not as expected
    [Teardown]    Remove File    ${pt}
