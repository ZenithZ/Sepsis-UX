#!/bin/bash
num=$(ps -x | grep 'ng serve' -c)
if [ $num == 2 ]
then
	pid=$(ps -x | grep 'ng serve' | head -1 | cut -d' ' -f1)
	if [ ! -z "$pid" ]
	then
		kill $pid
	fi
fi
cd ../dashboard
$(ng config -g cli.warnings.versionMismatch false)
$(ng serve > /dev/null)
