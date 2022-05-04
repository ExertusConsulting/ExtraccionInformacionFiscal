using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace logic.Common.Resources
{
    public class CtrlsTranslator
    {
        private const string pageTitleKey = "Titulo";

        public static void Translate(Page component, KeyValuePlainTextResource ResourceManager)
        {
            string titulo = ResourceManager.GetMessage(pageTitleKey);
            component.Title = string.IsNullOrWhiteSpace(titulo) ? string.Empty : titulo;
            Control currentControl = (Control)component.Page;
            FindControls(ResourceManager, currentControl);
        }

        private static void FindControls(KeyValuePlainTextResource ResourceManager, Control control)
        {
            Label lbl = control as Label;
            if (lbl != null && control.ID != null)
            {
                TranslateLabel(ResourceManager, control.ID, lbl);
                return;
            }

            ImageButton imgButton = control as ImageButton;
            if (imgButton != null && control.ID != null)
            {
                TranslateImageButton(ResourceManager, control.ID, imgButton);
                return;
            }

            Image image = control as Image;
            if (image != null && control.ID != null)
            {
                TranslateImage(ResourceManager, control.ID, image);
                return;
            }

            Button btn = control as Button;
            if (btn != null && control.ID != null)
            {
                TranslateButton(ResourceManager, control.ID, btn);
                return;
            }

            CheckBox check = control as CheckBox;
            if (check != null && control.ID != null)
            {
                TranslateCheckBox(ResourceManager, check.ID, check);
                return;
            }

            HyperLink link = control as HyperLink;
            if (link != null && control.ID != null)
            {
                TranslateLink(ResourceManager, control.ID, link);
                return;
            }

            GridView webGrid = control as GridView;
            if (webGrid != null && control.ID != null)
            {
                TranslateWebGrid(ResourceManager, control.ID, webGrid);
                return;
            }

            CheckBoxList checkBoxList = control as CheckBoxList;
            if (checkBoxList != null && control.ID != null)
            {
                TranslateCheckBoxList(ResourceManager, control.ID, checkBoxList);
                return;
            }

            RadioButtonList radioButtonList = control as RadioButtonList;
            if (radioButtonList != null && control.ID != null)
            {
                TranslateRadioList(ResourceManager, control.ID, radioButtonList);
                return;
            }

            DropDownList dropDownList = control as DropDownList;
            if (dropDownList != null && control.ID != null)
            {
                TranslateDropDownList(ResourceManager, control.ID, dropDownList);
                return;
            }

            FindChildControls(ResourceManager, control);
        }

        private static void FindChildControls(KeyValuePlainTextResource ResourceManager, Control control)
        {
            if (control.Controls.Count > 0)
            {
                foreach (Control control1 in control.Controls)
                {
                    FindControls(ResourceManager, control1);
                }
            }
        }

        private static void TranslateLabel(KeyValuePlainTextResource ResourceManager, string id, Label currentCtrl)
        {
            string text = string.Empty;

            text = ResourceManager.GetMessage(id);
            if (!string.IsNullOrEmpty(text))
            {
                currentCtrl.Text = text;
            }
        }

        private static void TranslateCheckBox(KeyValuePlainTextResource ResourceManager, string id, CheckBox currentCtrl)
        {
            string text = string.Empty;

            text = ResourceManager.GetMessage(id);
            if (!string.IsNullOrEmpty(text))
            {
                currentCtrl.Text = text;
            }
        }

        private static void TranslateCheckBoxList(KeyValuePlainTextResource ResourceManager, string id, CheckBoxList currentCtrl)
        {
            string text = string.Empty;

            text = ResourceManager.GetMessage(id);

            foreach (ListItem item in currentCtrl.Items)
            {
                text = ResourceManager.GetMessage(string.Format("{0}-{1}", id, item.Value));

                if (!string.IsNullOrEmpty(text))
                {
                    item.Text = text;
                }
            }
        }

        private static void TranslateRadioList(KeyValuePlainTextResource ResourceManager, string id, RadioButtonList currentCtrl)
        {
            string text = string.Empty;

            text = ResourceManager.GetMessage(id);

            foreach (ListItem item in currentCtrl.Items)
            {
                text = ResourceManager.GetMessage(string.Format("{0}-{1}", id, item.Value));

                if (!string.IsNullOrEmpty(text))
                {
                    item.Text = text;
                }
            }
        }


        private static void TranslateDropDownList(KeyValuePlainTextResource ResourceManager, string id, DropDownList currentCtrl)
        {
            string text = string.Empty;

            text = ResourceManager.GetMessage(id);

            foreach (ListItem item in currentCtrl.Items)
            {
                text = ResourceManager.GetMessage(string.Format("{0}-{1}", id, item.Value));

                if (!string.IsNullOrEmpty(text))
                {
                    item.Text = text;
                }
            }
        }


        private static void TranslateLink(KeyValuePlainTextResource ResourceManager, string id, HyperLink currentCtrl)
        {
            string text = string.Empty;

            text = ResourceManager.GetMessage(id);
            if (!string.IsNullOrEmpty(text))
            {
                currentCtrl.Text = text;
            }
        }

        private static void TranslateButton(KeyValuePlainTextResource ResourceManager, string id, Button currentCtrl)
        {
            string text = string.Empty;
            text = ResourceManager.GetMessage(id);

            if (!string.IsNullOrEmpty(text))
            {
                currentCtrl.Text = text;
            }
        }

        private static void TranslateImageButton(KeyValuePlainTextResource ResourceManager, string id, ImageButton currentCtrl)
        {
            string text = string.Empty;
            text = ResourceManager.GetMessage(id);

            if (!string.IsNullOrEmpty(text))
            {
                currentCtrl.ToolTip = text;
            }
        }

        private static void TranslateImage(KeyValuePlainTextResource ResourceManager, string id, Image currentCtrl)
        {
            string text = string.Empty;
            text = ResourceManager.GetMessage(id);

            if (!string.IsNullOrEmpty(text))
            {
                currentCtrl.ToolTip = text;
            }
        } 

        private static void TranslateWebGrid(KeyValuePlainTextResource ResourceManager, string id, GridView currentCtrl)
        {
            string text = null;  

            //Traducir columnas
            foreach (DataControlField column in currentCtrl.Columns)
            {
                text = ResourceManager.GetMessage(string.Format("{0}-{1}", id, column.AccessibleHeaderText ));

                if (!string.IsNullOrEmpty(text))
                {
                    column.HeaderText = text;
                } 
            }
        } 
    }
}