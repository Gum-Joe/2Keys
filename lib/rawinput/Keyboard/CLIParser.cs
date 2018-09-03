using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Forms;
using CommandLine;

namespace Util
{  
    [Verb("detect", HelpText = "Detects a keyboard's HID and outputs the result and/or stores it in a config")]
    public class DetectOptions
    {
        [Option('c', "config", Required = true, HelpText = ".yml config file to store HID in keyboard.HID or keyboard.name.HID")]
        public string ConfigFile { get; set; }
    }
    public class CLIParser
    {
        private readonly string[] _args;
        /// <summary>
        /// Parses Command line args
        /// </summary>
        /// <param name="args">CLI arguments from main()</param>  
        public CLIParser(string[] args)
        {
            _args = args;
        }

        /**private int getCLIArgs(Func<DetectOptions> callback)
        {
            return Parser.Default.ParseArguments<DetectOptions>(args)
                .MapResult(
                    (DetectOptions opts) => callback(opts),
                    errs => 1);
        }*/

        private void parseCLI()
        {
            
        }

        public void run()
        {
            if (_args.Length > 0)
            {
                if (_args[0] == "detect")
                {
                    // Run detector
                    // Look for config file
                    List<string> args = new List<string>(_args);
                    var configOpt = args.IndexOf("--config");
                    string configFile;
                    if (configOpt > 0)
                    {
                        configFile = args[args.IndexOf("--config") + 1];
                    } else {
                        throw new System.Exception("Error: No config file specified");
                    }
                    Application.Run(new Keyboard.KeyboardDetector(configFile));
                } else if (_args[0] == "help") {
                    Console.WriteLine("Commands:");
                } else {
                    // Run keyboard
                    Application.Run(new Keyboard.Keyboard());
                }
            } else {
                // Run keyboard
                Application.Run(new Keyboard.Keyboard());
            }
        }
    }
}