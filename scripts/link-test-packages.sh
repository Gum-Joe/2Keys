# DOES NOT WORK
cd packages\\\@twokeys\\core
npm link
cd ..\\addons
npm link
cd ..\\..\\..\\executors\\\@twokeys\\executor-ahk
npm link
cd ..\\..\\..\\detectors\\detector-desktop\\controller
npm link
echo Done.
echo MAKE SURE TO REMOVE ALL FILES CALLED package-lock.json