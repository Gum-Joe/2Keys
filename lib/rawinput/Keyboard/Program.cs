using System;
using System.Windows.Forms;
using Util;

namespace App
{
    static class Program
    {
        /// <summary>    
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
            // Parse CLI args
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            CLIParser parser = new CLIParser(args);
            parser.run();
        }
    }
}