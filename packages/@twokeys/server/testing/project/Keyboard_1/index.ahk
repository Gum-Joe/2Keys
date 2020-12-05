CallFunc() {
	MsgBox "HELLO WORLD"
  ;SetWorkingDir("..")
  MsgBox A_WorkingDir
}

TestFunc() {
  MsgBox "It works!"
}

RunTestForExecution1() {
  FileAppend("IT WORKED!", TWOKEYS_CWD "\RunTestForExecution1.txt")
}

RunTestForExecution2() {
  FileAppend("IT WORKED!", TWOKEYS_CWD "\RunTestForExecution2.txt")
}

RunTestForExecution3() {
  FileAppend("IT WORKED!", TWOKEYS_CWD "\RunTestForExecution3.txt")
}

RunTestForExecution4() {
  FileAppend("IT WORKED!", TWOKEYS_CWD "\RunTestForExecution4.txt")
}

RunBenchmarkTest() {
  Send "A"
}

