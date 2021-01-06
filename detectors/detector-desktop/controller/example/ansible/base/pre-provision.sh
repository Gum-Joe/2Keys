#!/bin/bash

echo Preparing this VM for ansible provising....
echo sudo apk update
sudo apk update
echo sudo apk upgrade
sudo apk upgrade

test $? -eq 0 || sudo apk fix

# Restart sshd service, as it may or may not need to be done
sudo rc-service sshd restart

echo Ready.