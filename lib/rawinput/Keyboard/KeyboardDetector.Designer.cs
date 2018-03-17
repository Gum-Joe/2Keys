namespace Keyboard
{
    partial class KeyboardDetector
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.mapLabelStep = new System.Windows.Forms.Label();
            this.hidText = new System.Windows.Forms.TextBox();
            this.activeKeyboard = new System.Windows.Forms.GroupBox();
            this.confirm = new System.Windows.Forms.Button();
            this.cancel = new System.Windows.Forms.Button();
            this.activeKeyboard.SuspendLayout();
            this.SuspendLayout();
            // 
            // mapLabelStep
            // 
            this.mapLabelStep.AutoSize = true;
            this.mapLabelStep.Location = new System.Drawing.Point(199, 27);
            this.mapLabelStep.Name = "mapLabelStep";
            this.mapLabelStep.Size = new System.Drawing.Size(188, 13);
            this.mapLabelStep.TabIndex = 0;
            this.mapLabelStep.Text = "Press any key on the keyboard to map";
            this.mapLabelStep.Click += new System.EventHandler(this.label1_Click);
            // 
            // hidText
            // 
            this.hidText.Location = new System.Drawing.Point(18, 43);
            this.hidText.Name = "hidText";
            this.hidText.ReadOnly = true;
            this.hidText.Size = new System.Drawing.Size(534, 20);
            this.hidText.TabIndex = 3;
            this.hidText.TextAlign = System.Windows.Forms.HorizontalAlignment.Center;
            // 
            // activeKeyboard
            // 
            this.activeKeyboard.Controls.Add(this.hidText);
            this.activeKeyboard.Controls.Add(this.mapLabelStep);
            this.activeKeyboard.Location = new System.Drawing.Point(12, 6);
            this.activeKeyboard.Name = "activeKeyboard";
            this.activeKeyboard.Size = new System.Drawing.Size(568, 83);
            this.activeKeyboard.TabIndex = 4;
            this.activeKeyboard.TabStop = false;
            this.activeKeyboard.Text = "Active Keyboard";
            // 
            // confirm
            // 
            this.confirm.Location = new System.Drawing.Point(505, 95);
            this.confirm.Name = "confirm";
            this.confirm.Size = new System.Drawing.Size(75, 23);
            this.confirm.TabIndex = 5;
            this.confirm.Text = "Confirm";
            this.confirm.UseVisualStyleBackColor = true;
            // 
            // cancel
            // 
            this.cancel.Location = new System.Drawing.Point(424, 95);
            this.cancel.Name = "cancel";
            this.cancel.Size = new System.Drawing.Size(75, 23);
            this.cancel.TabIndex = 6;
            this.cancel.Text = "Cancel";
            this.cancel.UseVisualStyleBackColor = true;
            // 
            // KeyboardDetector
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(592, 123);
            this.Controls.Add(this.cancel);
            this.Controls.Add(this.confirm);
            this.Controls.Add(this.activeKeyboard);
            this.Name = "KeyboardDetector";
            this.Text = "KeyboardDetector";
            this.activeKeyboard.ResumeLayout(false);
            this.activeKeyboard.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Label mapLabelStep;
        private System.Windows.Forms.TextBox hidText;
        private System.Windows.Forms.GroupBox activeKeyboard;
        private System.Windows.Forms.Button confirm;
        private System.Windows.Forms.Button cancel;
    }
}