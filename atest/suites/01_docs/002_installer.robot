*** Settings ***
Documentation       Verify the `installer` demo.

Resource            ../../resources/rjsf.resource
Resource            ../../resources/urljsf.resource
Library             Collections
Library             OperatingSystem
Library             SeleniumLibrary
Library             urllib.parse
Library             ../../libraries/archive.py

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
    Make And Fix A Package Error
    Make And Fix A Channel Error
    Verify Installer URL
    Verify Installer Download
    Verify Installer Archive    icon.png
    Verify Installer Archive    icon.svg


*** Keywords ***
Try Licenses
    [Documentation]    Exercise the license list
    Scroll To    ${CSS_LICENSE_CHECK}
    Mouse Over    css:${CSS_LICENSE}
    Input Text    css:${CSS_LICENSE}    ${BAD_LICENSE}
    Checkbox Should Not Be Selected    css:${CSS_LICENSE_CHECK}
    Input Text    css:${CSS_LICENSE}    ${GOOD_LICENSE}
    Checkbox Should Be Selected    css:${CSS_LICENSE_CHECK}

Make And Fix A Package Error
    [Documentation]    Exercise a complex operation with the packages array
    Form Should Not Contain Errors
    ${add} =    Set Variable    ${CSS_R_ARRAY_ITEM_ADD}\[title="dependencies"]
    Scroll To    ${add}
    Click Element    css:${add}
    ${p2} =    Set Variable    input#urljsf-0-pixi_dependencies_1_package
    Wait Until Page Contains    missing the required field 'package'
    Scroll To    ${CSS_U_SUBMIT}
    Form Should Contain 1 Error
    Capture Page Screenshot    01-package-empty.png
    Click Element    css:${CSS_U_SUBMIT}
    Input Text    css:${p2}    python
    Wait Until Page Contains    2 dependencies have the name
    Form Should Contain 1 Error
    Scroll To    ${CSS_U_SUBMIT}
    Capture Page Screenshot    02-package-dupe.png
    Input Text    css:${p2}    urljsf
    Form Should Not Contain Errors

Make And Fix A Channel Error
    [Documentation]    Exercise a complex operation with the channels array
    Form Should Not Contain Errors
    ${add} =    Set Variable    ${CSS_R_ARRAY_ITEM_ADD}\[title="channels"]
    Scroll To    ${add}
    Click Element    css:${add}
    ${p2} =    Set Variable    input#urljsf-0-pixi_channels_1
    Wait Until Page Contains    must be a string but it was undefined.
    Wait Until Page Contains    must match a schema in anyOf.
    Form Should Contain 2 Errors
    Capture Page Screenshot    01-channel-empty.png
    Input Text    css:${p2}    bioconda
    Form Should Not Contain Errors

Verify Installer URL
    [Documentation]    Verify the URL against an expected value.
    ${url} =    Get Element Attribute    css:${CSS_U_SUBMIT}    href
    ${raw} =    Unquote    ${url.split(",", 1)[1]}
    ${from_toml} =    TOML.Loads    ${raw}
    ${expected} =    Get TOML Fixture    002_installer.toml
    Should Be JSON Equivalent    ${from_toml}    ${expected}
    ${copy} =    Set Variable    css:${CSS_COPY_BUTTON}
    Scroll To    ${CSS_COPY_BUTTON}
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

Verify Installer Archive
    [Documentation]    Verify the archive downloads correctly
    [Arguments]    ${icon}
    ${icon_file} =    Set Variable    ${ROOT}${/}docs${/}_static${/}${icon}
    Choose File    css:#urljsf-0-pixi_icon    ${icon_file}
    Wait Until Page Contains    ${icon}
    ${url} =    Get Element Attribute    xpath://pre[3]    textContent
    ${url} =    Set Variable    ${url.strip()[4:]}
    File In Archive URL Should Match    ${url}    ${icon}    ${icon_file}
    ...    Icon did not match
