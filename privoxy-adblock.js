/**
 * @fileOverview converting Adblock filter lists to Privoxy format.
 * @author <a href="lewisje@alumni.iu.edu">James Edward Lewis II</a>
 * @version 0.0.3
 */

var v = new ActiveXObject('Shell.Application'),
  http = new ActiveXObject('Microsoft.XMLHTTP'),
  fso = new ActiveXObject('Scripting.FileSystemObject'),
  env = new ActiveXObject('WScript.Shell'), testing,
  tmp = env.expandEnvironmentStrings('%TEMP%'),
  prg32 = env.ExpandEnvironmentStrings('%PROGRAMFILES(X86)%'),
  defaultprivoxydir = (fso.FolderExists(prg32) ? prg32 :
    env.ExpandEnvironmentStrings('%PROGRAMFILES%')) + '\\Privoxy',
  defaulturls = ['http://jansal.net/m.txt',
    'http://pgl.yoyo.org/as/serverlist.php?hostformat=adblockplus&mimetype=plaintext',
    'https://easylist-downloads.adblockplus.org/easylist.txt',
    'https://easylist-downloads.adblockplus.org/easylist_noelemhide.txt',
    'https://easylist-downloads.adblockplus.org/easylistgermany+easylist.txt',
    'https://easylist-downloads.adblockplus.org/malwaredomains_full.txt',
    'https://easylist-downloads.adblockplus.org/easyprivacy.txt',
    'https://easylist-downloads.adblockplus.org/easyprivacy+easylist.txt',
    'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt',
    'https://easylist-downloads.adblockplus.org/fb_annoyances_full.txt',
    'https://easylist-downloads.adblockplus.org/message_seen_remover_for_facebook.txt',
    'https://easylist-downloads.adblockplus.org/fanboy-annoyance.txt',
    'https://easylist-downloads.adblockplus.org/fanboy-social.txt',
    'https://secure.fanboy.co.nz/r/fanboy-complete.txt',
    'https://secure.fanboy.co.nz/r/fanboy-ultimate.txt',
    'https://secure.fanboy.co.nz/enhancedstats.txt',
    'https://raw.githubusercontent.com/r4vi/block-the-eu-cookie-shit-list/master/filterlist.txt',
    'https://raw.githubusercontent.com/liamja/Prebake/master/obtrusive.txt',
    'https://raw.githubusercontent.com/reek/anti-adblock-killer/master/anti-adblock-killer-filters.txt',
    'https://lists.malwarepatrol.net/cgi/getfile?receipt=f1379438547&product=8&list=mozilla_adblock',
    'https://spam404bl.com/spam404scamlist.txt',
    'http://rickrolldb.com/ricklist.txt'];

/**
 * Cleans up after script termination. (not currently implemented)
 * @this {undefined}
 * @return {undefined}
 */
function cleanup() {
  'use strict';
  /*
  trap - INT TERM EXIT
  [[ -f "${pidfile}" ]] && rm "$pidfile"
  exit
  */
}

/**
 * Is any previous instance of this script already running?
 * (not currently implemented)
 * @this {undefined}
 * @param {string} pidfile
 * @return {boolean}
 */
function isrunning(pidfile) {
  'use strict';
  if (!fso.FileExists(pidfile)) return false;
  /*
  procpid=$(<"${pidfile}")
  [[ -z "${procpid}" ]] && return 1  #pid file contains no pid
  # check process list for pid existence and is an instance of this script
  [[ ! $(ps -p ${procpid} | grep $(basename ${0})) == "" ]] && value=0 || value=1
  return ${value}
  */
}

/**
 * Atomic creation of pid file with no race condition. (not currently implemented)
 * @this {undefined}
 * @param {string} mypid
 * @param {string} pidfile
 * @return {undefined}
 */
function createpidfile(mypid, pidfile) {
  'use strict';
  /*
  #Close stderr, don't overwrite existing file, shove my pid in the lock file.
  $(exec 2>&-; set -o noclobber; echo "$mypid" > "$pidfile")
  [[ ! -f "${pidfile}" ]] && exit #Lock file creation failed
  procpid=$(<"${pidfile}")
  [[ ${mypid} -ne ${procpid} ]] && {
    #I'm not the pid in the lock file
    # Is the process pid in the lockfile still running?
    isrunning "${pidfile}" || {
      # No.  Kill the pidfile and relaunch
      rm "${pidfile}"
      $0 $@
    }
    exit
  }
  */
}

/**
 * Create a predictable pid file name, put it in the right inode.
 * (not currently implemented)
 * @this {undefined}
 * @return {string} mypidfile
 */
function pidfilename() {
  'use strict';
  /*
  myfile=$(basename "$0" .sh)
  whoiam=$(whoami)
  mypidfile="/tmp/${myfile}.pid"
  [[ "$whoiam" == 'root' ]] && mypidfile="/var/run/$myfile.pid"
  echo $mypidfile
  */
}

/**
 * Returns the filename corresponding to a filesystem path or URI.
 * @this {undefined}
 * @param {string} path
 * @return {string}
 */
function basename(path) {
  'use strict';
  return path.replace(/\\/g, '/').replace(/.*\//, '').replace(/[#?].*/, '');
}

/**
 * Download requested scripts and perform the conversion.
 * @this {undefined}
 * @param {string} privoxydir
 * @param {Array} urls
 * @return {undefined}
 */
function doconvert(privoxydir, urls) {
  'use strict';
  var url, file, actionfile, actionfiledest, filterfile, filterfiledest, i, s,
    tfil, acnm, ftnm, list, basenm, hrt, l = urls.length;
  for (i = l; i > 0; i--) {
    url = urls[l - i];
    basenm = basename(url);
    list = basenm.replace(/\.[^.]*$/, '') || basenm;
    file = tmp + '\\'  + list + '.txt';
    tfil = file + '.tmp';
    acnm = list + '.script.action';
    ftnm = list + '.script.filter';
    actionfile = tmp + '\\' + acnm;
    filterfile = tmp + '\\' + ftnm;

    testing && WScript.Echo('downloading ' + url + ' ...\n');
    http.open('GET', url, false);
    http.setRequestHeader('Accept','text/html');
    try {
      http.send();
      if (fso.FileExists(tfil)) fso.GetFile(tfil).Delete();
      if (hrt = http.responseText) s = fso.CreateTextFile(tfil, true);
    } catch (e) { }
    if (('' + s) && typeof hrt === 'string') {
      s.Write(hrt);
      s.Close();
    } else {
      if (typeof s === 'object') s.Close();
      if (fso.FileExists(tfil)) fso.GetFile(tfil).Delete();
    }

    /* wget removed in favor of native solution, next up, factor out sed
    v.ShellExecute('wget', '-t 3 --no-check-certificate -0 "' + file + '" "' + url +
      '" > "' + tmp + '\\wget-' + url.replace(/\//g,'-') + '.log"', '', '', 0);*/

    // clean up files
    if (fso.FileExists(tfil) && fso.FileExists(file)) {
      fso.GetFile(file).Delete();
      fso.MoveFile(tfil, file);
    }
    fso.FileExists(actionfile) && fso.GetFile(actionfile).Delete();
    fso.FileExists(filterfile) && fso.GetFile(filterfile).Delete();

    if (!fso.FileExists(file)) continue;

    s = fso.OpenTextFile(file, 1);
    if (!s.ReadLine().match(/^.*\[Adblock.*\].*$/)) {
      testing && WScript.Echo('The list received from ' + url + ' isn\'t an Adblock list. (skipped)\n');
      s.Close();
      continue;
    }
    s.Close();

    testing && WScript.Echo('Creating actionfile for ' + list + ' ...\n');
    s = fso.CreateTextFile(actionfile, true);
    s.WriteLine('{ +block{' + list + '} }');
    s.Close();
    env.run('cmd /c sed "/^!.*/d;1,1 d;/^@@.*/d;/\\$.*/d;/#/d;s/\\./\\\\./g;s/\\?/\\\\?/g;s/\\*/.*/g;s/(/\\\\(/g;s/)/\\\\)/g;s/\\[/\\\\[/g;s/\\]/\\\\]/g;s/\\^/[\\/\\&:\\?=_]/g;s/^||/\\./g;s/^|/^/g;s/|$/\\$/g;/|/d" "' +
      file + '" >> "' + actionfile + '"', 0, true);

    testing && WScript.Echo('... creating filterfile for ' + list + ' ...\n');
    s = fso.CreateTextFile(filterfile, true);
    s.WriteLine('FILTER: ' + list + ' Tag filter of ' + list);
    s.Close();
    env.run('cmd /c sed "/^#/!d;s/^##//g;s/^#\\(.*\\)\\[.*\\]\\[.*\\]*/s@<([a-zA-Z0-9]+)\\\\s+.*id=.?\\1.*>.*<\\/\\\\1>@@g/g;s/^#\\(.*\\)/s@<([a-zA-Z0-9]+)\\\\s+.*id=.?\\1.*>.*<\\/\\\\1>@@g/g;s/^\\.\\(.*\\)/s@<([a-zA-Z0-9]+)\\\\s+.*class=.?\\1.*>.*<\\/\\\\1>@@g/g;s/^a\\[\\(.*\\)\\]/s@<a.*\\1.*>.*<\\/a>@@g/g;s/^\\([a-zA-Z0-9]*\\)\\.\\(.*\\)\\[.*\\]\\[.*\\]*/s@<\\1.*class=.?\\2.*>.*<\\/\\1>@@g/g;s/^\\([a-zA-Z0-9]*\\)#\\(.*\\):.*[:[^:]]*[^:]*/s@<\\1.*id=.?\\2.*>.*<\\/\\1>@@g/g;s/^\\([a-zA-Z0-9]*\\)#\\(.*\\)/s@<\\1.*id=.?\\2.*>.*<\\/\\1>@@g/g;s/^\\[\\([a-zA-Z]*\\).=\\(.*\\)\\]/s@\\1^=\\2>@@g/g;s/\\^/[\\/\\&:\\?=_]/g;s/\\.\\([a-zA-Z0-9]\\)/\\\\.\\1/g" "' +
      file + '" >> "' + filterfile + '"', 0, true);
    testing && WScript.Echo('... filterfile created - adding filterfile to actionfile ...\n');
    s = fso.OpenTextFile(actionfile, 8);
    s.WriteLine('{ +filter{' + list + '} }');
    s.WriteLine('*');
    testing && WScript.Echo('... filterfile added ...\n... creating and adding whitelist for urls ...\n');
    s.WriteLine('{ -block }');
    s.Close();
    env.run('cmd /c sed "/^@@.*/!d;s/^@@//g;/\\$.*/d;/#/d;s/\\./\\\\./g;s/\\?/\\\\?/g;s/\\*/.*/g;s/(/\\\\(/g;s/)/\\\\)/g;s/\\[/\\\\[/g;s/\\]/\\\\]/g;s/\\^/[\\/\\&:\\?=_]/g;s/^||/\\./g;s/^|/^/g;s/|$/\\$/g;/|/d" "' +
      file + '" >> "' + actionfile + '"', 0, true);
    testing && WScript.Echo('... created and added whitelist - creating and adding image handler ...\n');

    s = fso.OpenTextFile(actionfile, 8);
    s.WriteLine('{ -block +handle-as-image }');
    s.Close();
    env.run('cmd /c sed "/^@@.*/!d;s/^@@//g;/\\$.*image.*/!d;s/\\$.*image.*//g;/#/d;s/\\./\\\\./g;s/\\?/\\\\?/g;s/\\*/.*/g;s/(/\\\\(/g;s/)/\\\\)/g;s/\\[/\\\\[/g;s/\\]/\\\\]/g;s/\\^/[\\/\\&:\\?=_]/g;s/^||/\\./g;s/^|/^/g;s/|$/\\$/g;/|/d" "' +
      file + '" >> "' + actionfile + '"', 0, true);
    testing && WScript.Echo('... created and added image handler ...\n... created actionfile for ' + list + '\n');

    actionfiledest = privoxydir + '\\' + acnm;
    testing && WScript.Echo('... copying ' + actionfile + ' to ' + actionfiledest + '\n');
    fso.CopyFile(actionfile, actionfiledest);
    filterfiledest = privoxydir + '\\' + ftnm;
    testing && WScript.Echo('... copying ' + filterfile + ' to ' + filterfiledest + '\n');
    fso.CopyFile(filterfile, filterfiledest);
  }
}

/**
 * Prints command usage.
 * @this {undefined}
 * @return {undefined}
 */
function usage() {
  'use strict';
  testing && WScript.Echo('Usage: ' + WScript.ScriptName + ' [-d] [-p <privoxy config dir>] [-u <url1>] [-u <url2>]...\n');
}

/**
 * Main script entry point.
 * @this {undefined}
 * @return {undefined}
 */
function main() {
  'use strict';
  var pidfile = pidfilename(), tempdir = tmp, objArgs = WScript.Arguments,
    privoxydir = defaultprivoxydir, urls = defaulturls, debug, i, arg, next,
    l = objArgs.length;
  if (isrunning(pidfile)) {
    testing && WScript.Echo(WScript.ScriptName + ' is already running\n');
    return;
  }

  /* (not currently implemented)
  createpidfile $$ "${pidfile}"
  trap 'cleanup' INT TERM EXIT
  debug="false"
  trap 'logger -t $0 -i -- $USER : $BASH_COMMAND' ERR  #log errors regardless
  */

  for (i = l; i > 0; i--) {
    arg = objArgs[l - i];
    if (arg.charAt(0) !== '-') continue;
    next = objArgs[l - i + 1] || '';
    switch (arg) {
      case '-p':
        if (next.charAt(0) === '-') {
          testing && WScript.Echo('Option -p must be followed by a directory path.\n');
          usage();
          break;
        }
        privoxydir = next || defaultprivoxydir;
        break;
      case '-u':
        if (next.charAt(0) === '-') {
          testing && WScript.Echo('Option -u must be followed by a URL.\n');
          usage();
          break;
        }
        urls.push(next);
        break;
      case '-d':
        debug = true;
        break;
      default:
        usage();
        break;
    }
  }

  /* [[ "$debug" == "true" ]] && trap 'logger -t $0 -i -- $USER : $BASH_COMMAND' DEBUG #syslog everything if we're debugging */
  if (!urls.length || !fso.FolderExists(privoxydir)) usage();

  // perform the operation
  doconvert(privoxydir, urls);
}

main();
