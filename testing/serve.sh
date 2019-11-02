#!/bin/bash
pid=$(ps -x | grep 'ng serve' | head -1 | cut -d' ' -f1)
if [ ! -z "$pid" ]
then
	kill $pid
fi
cd ../dashboard
$(ng config -g cli.warnings.versionMismatch false)
$(ng serve > /dev/null)
