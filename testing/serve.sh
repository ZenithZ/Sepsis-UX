#!/bin/bash
cd ../dashboard
$(ng config -g cli.warnings.versionMismatch false)
$(ng serve > /dev/null)