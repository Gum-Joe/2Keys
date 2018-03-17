using System;
using RawInput_dll;
using System.Diagnostics;
using System.Globalization;
using System.Windows.Forms;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Timers;

// In regards to updateing pressed keys, will wait for macro to finish
// TODO: Use KeyValuePair<int, bool> instead of lists when looping through dictionaries
namespace Keyboard
{
    public partial class Keyboard : Form
    {
        private readonly RawInput _rawinput;
        // static readonly int waitTime = 50;
        //private System.Timers.Timer timeKeyed = new System.Timers.Timer(waitTime);
        private Dictionary<int, bool> map = new Dictionary<int, bool>();
        //private String pressed = "";
        //private Dictionary<int, bool> oldKeys = new Dictionary<int, bool>();
        private bool AHK_MODE = true;

        const bool CaptureOnlyInForeground = false; // So that we don't have to switch to app to get keys
        // Todo: add checkbox to form when checked/uncheck create method to call that does the same as Keyboard ctor 

        public Keyboard()
        {
            InitializeComponent();
            AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;

            _rawinput = new RawInput(Handle, CaptureOnlyInForeground);
           
            _rawinput.AddMessageFilter();   // Adding a message filter will cause keypresses to be handled
            Win32.DeviceAudit();            // Writes a file DeviceAudit.txt to the current directory

            _rawinput.KeyPressed += OnKeyPressed;

            // Timer
            //timeKeyed.Elapsed += WatchKeys;
            //timeKeyed.AutoReset = true;
            //timeKeyed.Enabled = true;
        }

        /**private void WatchKeys(Object source, ElapsedEventArgs e)
        {
            // WAIT
            var t = Task.Factory.StartNew(async () =>
            {
                // Mutate
                List<int> list = new List<int>(map.Keys);
                foreach (int key in list)
                {
                    oldKeys[key] = map[key];
                }
                await Task.Delay(waitTime);
                waitKeyCheck();
            });
            t.Wait();
        }

        private void waitKeyCheck() {
            // Compare
            // If were true and now false then u have key combination
            // Store keys in a List.
            List<int> list = new List<int>(map.Keys);
            foreach (int key in list)
            {
                if (map[key] == false && oldKeys[key] == true)
                {
                    Debug.WriteLine("Key released: " + key);
                    pressed += key + " + ";
                }
            }

            if (pressed != "")
            {
                Debug.WriteLine(pressed);
            }

        } */

        private bool IsNotModifyerKey(KeyPressEvent keyPress)
        {
            // Checks what keys we have
            // Is it NOT a modifyer key
            //Debug.WriteLine(keyPress.VKey);
            if (keyPress.VKey == 17 || keyPress.VKey == 91 || keyPress.VKey == 18 || keyPress.VKey == 16) // CTRL, ALT, WINKEY, SHIFT
            {
                return false;
            }
            return true;

        }
        private void RunKeys()
        {
            string pressedKeys = "";
            foreach(KeyValuePair<int, bool> key in map)
            {
                pressedKeys += KeyMapper.GetKeyName(key.Key) + " + ";
            }
            Debug.WriteLine(pressedKeys);
            pressedKeys = "";
        }
        private void OnKeyPressed(object sender, RawInputEventArg e)
        {
            lbHandle.Text = e.KeyPressEvent.DeviceHandle.ToString();
            lbType.Text = e.KeyPressEvent.DeviceType;
            lbName.Text = e.KeyPressEvent.DeviceName;
            lbDescription.Text = e.KeyPressEvent.Name;
            lbKey.Text = e.KeyPressEvent.VKey.ToString(CultureInfo.InvariantCulture);
            lbNumKeyboards.Text = _rawinput.NumberOfKeyboards.ToString(CultureInfo.InvariantCulture);
            lbVKey.Text = e.KeyPressEvent.VKeyName;
            lbSource.Text = e.KeyPressEvent.Source;
            lbKeyPressState.Text = e.KeyPressEvent.KeyPressState;
            lbMessage.Text = string.Format("0x{0:X4} ({0})", e.KeyPressEvent.Message);
           
            switch (e.KeyPressEvent.Message)
            {
                case Win32.WM_KEYDOWN:
                    map[e.KeyPressEvent.VKey] = true;
                    break;
                 case Win32.WM_KEYUP:
                    Debug.WriteLine(e.KeyPressEvent.VKeyName);
                    if (AHK_MODE)
                    {
                        // AHK Mode
                        // We can only get Win32.WM_KEYUP thus
                        // So record each key
                        map[e.KeyPressEvent.VKey] = true;
                        if (!IsNotModifyerKey(e.KeyPressEvent))
                        {
                            RunKeys();
                            map = new Dictionary<int, bool>();
                        }
                    } else {
                        if (IsNotModifyerKey(e.KeyPressEvent))
                        {
                            RunKeys();
                        }
                        map.Remove(e.KeyPressEvent.VKey);
                    }
                    break;
            }
        }

        private void Keyboard_FormClosing(object sender, FormClosingEventArgs e)
        {
            _rawinput.KeyPressed -= OnKeyPressed;
        }

        private static void CurrentDomain_UnhandledException(Object sender, UnhandledExceptionEventArgs e)
        {
            var ex = e.ExceptionObject as Exception;

            if (null == ex) return;

            // Log this error. Logging the exception doesn't correct the problem but at least now
            // you may have more insight as to why the exception is being thrown.
            Debug.WriteLine("Unhandled Exception: " + ex.Message);
            Debug.WriteLine("Unhandled Exception: " + ex);
            MessageBox.Show(ex.Message);
        }

        private void label3_Click(object sender, EventArgs e)
        {

        }
    }
}
