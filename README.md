privoxy-adblock-jscript
=======================

A JScript for Windows (Windows Script Host) that converts Adblock lists to the Privoxy format.

Based on code by Andrwe Lord Weber found [here](http://andrwe.org/scripting/bash/privoxy-blocklist), as modified for OS X by [skroll](https://github.com/skroll/privoxy-adblock).

This script is modified to work in Windows Script Host and may not require Admin privileges; it is recommended to make a Scheduled Task running this script periodically (about once per week, the same frequency at which Adblock Plus itself updates lists by default).

**Note:** This script requires `wget` and `sed` to be installed on the system; get them as part of [GnuWin32](http://getgnuwin32.sourceforge.net/) and be sure to add its bin directory (by default `C:\Gnu32\bin`) to your PATH environment variable.

Usage
-----
By default, this script fetches the easylist script and installs it into the Privoxy installation directory, which is also the default directory for configuration, actions, and filter files; first it will try `%PROGRAMFILES(X86)%\Privoxy` (64-bit Windows) and then `%PROGRAMFILES%\Privoxy` (32-bit Windows). If that is not appropriate for your system, parameters can be passed to control the behavior of the script.

    > privoxy-adblock.js [-d] [-p <privoxy config dir>] [-u <url1>] [-u <url2>]...

| Switch/Parameter        | Description                             |
| :---------------------: | --------------------------------------- |
| -d                      | Turn on debugging                       |
| -p &lt;privoxy path&gt; | Path to Privoxy configuration directory |
| -u &lt;url&gt;          | Downloads/converts adblock filter list  |

The script supports the passing of multiple URLs, the output of the converted Adblock filter lists will be `[basename].script.action` and `[basename].script.filter`.

Once the files have been created, they must be added to the privoxy configuration. For example:

    actionsfile easylist.script.action
    filterfile easylist.script.filter

Once the file is added, rerunning the script with the same parameters will automatically update the Privoxy filters.

Environment Variables
---------------------

| Environment Variable | Description                                        | Default                |
| :------------------: | -------------------------------------------------- | :--------------------: |
| PROGRAMFILES(X86)    | 32-bit Program Files directory (x64 Windows only)  | C:\Program Files (x86) |
| PROGRAMFILES         | Program Files directory                            | C:\Program Files       |

