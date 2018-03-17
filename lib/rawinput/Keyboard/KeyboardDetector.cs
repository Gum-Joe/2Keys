using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using RawInput_dll;

namespace Keyboard
{
    public partial class KeyboardDetector : Form
    {
        private readonly RawInput _rawinput;
        const bool CaptureOnlyInForeground = false;

        public KeyboardDetector()
        {
            InitializeComponent();
            // From Keyboard.cs
            _rawinput = new RawInput(Handle, CaptureOnlyInForeground);

            _rawinput.AddMessageFilter();   // Adding a message filter will cause keypresses to be handled
            Win32.DeviceAudit();            // Writes a file DeviceAudit.txt to the current directory

            _rawinput.KeyPressed += OnKeyPressed;
            confirm.Focus();
        }

        private void OnKeyPressed(object sender, RawInputEventArg e)
        {
            hidText.Text = e.KeyPressEvent.DeviceName;

            /** switch (e.KeyPressEvent.Message)
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
                    }
                    else
                    {
                        if (IsNotModifyerKey(e.KeyPressEvent))
                        {
                            RunKeys();
                        }
                        map.Remove(e.KeyPressEvent.VKey);
                    }
                    break;
            } */
        }

        private void label1_Click(object sender, EventArgs e)
        {

        }

        private void hidLabel_Click(object sender, EventArgs e)
        {

        }

        private void tableLayoutPanel1_Paint(object sender, PaintEventArgs e)
        {

        }

        private void label1_Click_1(object sender, EventArgs e)
        {

        }
    }
}
