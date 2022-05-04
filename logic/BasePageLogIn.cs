using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Configuration;
using logic;
using System.Data;
using System.Collections;
using System.Xml;
using System.IO;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using System.Runtime.Serialization;
using System.Text.RegularExpressions;
using System.Text;
using System.Net;
using System.Net.Mail; 
using System.Data.Common;
using System.Data.SqlClient; 
using System.Globalization; 
using System.Reflection; 
using System.Web.Configuration;
using System.Web.Script.Serialization;
using System.Web.Security; 
using logic.Common.Resources;
using System.Security.Cryptography;

namespace logic
{
    public class BasePageLogIn : System.Web.UI.Page
    {
        private const string SessionTime = "SessionTime";
        private const string SessionState = "SessionState";  
        private const string UidPage = "UidPage";
        public const string REMOTE_HOST = "REMOTE_HOST";

        KeyValuePlainTextResource resourceMgr, commonResourceMgr;

        public string Token
        {
            get { return this.GetSession("token") != null ? this.GetSession("token").ToString() : string.Empty; }
            set
            {
                this.SetSession("token", value, SessionStateModes.AllPages);
            }
        }

        public string SqlLanguage
        {
            get
            {
                CultureInfo culture = this.Session["SESSION_CULTURE"] as CultureInfo;
                if (culture != null)
                {
                    switch (culture.Name)
                    {
                        case "es-MX":
                            return "Spanish";
                        case "en-US":
                            return "English";
                        default:
                            return "Spanish";
                    }
                }

                return "Spanish";
            }
        }

        public KeyValuePlainTextResource ResourceManager
        {
            get
            {
                if (resourceMgr == null)
                    resourceMgr = ResourceFactory.CreateResource(this.GetType().Name, !IsPostBack, LenguajeCode);

                return resourceMgr;
            }
        }

        public KeyValuePlainTextResource CommonResourceManager
        {
            get
            {
                if (commonResourceMgr == null)
                    commonResourceMgr = ResourceFactory.CreateResource("GlobalResources", !IsPostBack, LenguajeCode);

                return commonResourceMgr;
            }
        }

        public string UIDPage
        {
            get
            {
                string value = ViewState[UidPage] as string;
                if (string.IsNullOrWhiteSpace(value))
                {
                    value = Guid.NewGuid().ToString();
                    ViewState.Add(UidPage, value);
                }

                return value;
            }
        }

        public string URL
        {
            get
            {
                return this.GetAppSetting("URL");
            }
        }

        public delegate void LanguageChanged(CultureInfo cultureInfo);

        public event LanguageChanged LanguageChangedEvent;

        public delegate void OnPageRefresh(EventArgs e);

        public event OnPageRefresh OnPageRefreshEvent;

        protected override void OnLoad(System.EventArgs e)
        {
            var jsonRecursos = this.GetCommonResourcesJSON();
            this.RunJavascriptBeforeLoadPage("var recursosGlobal = jQuery.parseJSON('" + jsonRecursos + "');");
            jsonRecursos = this.GetResourcesJSON();
            this.RunJavascript("var recursos = jQuery.parseJSON('" + jsonRecursos + "');");
            base.OnLoad(e);
        }

        protected override void OnPreInit(EventArgs e)
        {
            Response.AppendHeader("X-UA-Compatible", "IE=edge,chrome=1");
            this.Theme = (HttpContext.Current.Session["Tema"] == null ? "default" : HttpContext.Current.Session["Tema"].ToString());
            base.OnPreInit(e);
        }

        protected override void OnInit(System.EventArgs e)
        {
            if (!Page.IsPostBack)
            {
                CtrlsTranslator.Translate(this, this.ResourceManager);
                this.CleanSession();
            }

            base.OnInit(e);
            this.DisableClientCaching();
        }

        public void RaiseLanguageChanged(CultureInfo cultureInfo)
        {
            if (LanguageChangedEvent != null)
            {
                CultureManager.StoreCulture(cultureInfo);
                CtrlsTranslator.Translate(this, this.ResourceManager);
                LanguageChangedEvent(cultureInfo);
                Response.Redirect(Request.RawUrl);
            }
        }

        public void RaiseOnPageRefresh(EventArgs e)
        {
            if (OnPageRefreshEvent != null)
            {
                OnPageRefreshEvent(e);
            }
        }

        protected override void InitializeCulture()
        {
            base.InitializeCulture();
            CultureManager.Initialize();
        }

        public string GetMessage(string resourceID)
        {
            return ResourceManager.GetMessage(resourceID);
        }

        public void RunJavascript(string script)
        {
            ScriptManager.RegisterStartupScript(this.Page, this.Page.GetType(), Guid.NewGuid().ToString(), script, true);
        }

        public void RunJavascriptBeforeLoadPage(string script)
        {
            ScriptManager.RegisterClientScriptBlock(this.Page, this.Page.GetType(), Guid.NewGuid().ToString(), script, true);
        }

        public string GetAppSetting(string key)
        {
            return WebConfigurationManager.AppSettings[key];
        }

        public object GetSession(string name)
        {
            return Session[name];
        }

        public void SetSession(string name, object value, SessionStateModes sessionMode)
        {
            Hashtable hashSessionState;
            Hashtable hashSessionTime;

            if (sessionMode == SessionStateModes.SinglePage)
            {
                if (Session[SessionState] == null)
                {
                    hashSessionState = new Hashtable();
                    Session[SessionState] = hashSessionState;

                    hashSessionTime = new Hashtable();
                    Session[SessionTime] = hashSessionTime;
                }
                else
                {
                    hashSessionState = (Hashtable)Session[SessionState];
                    hashSessionTime = (Hashtable)Session[SessionTime];
                }

                if (!hashSessionState.ContainsKey(name))
                {
                    hashSessionState.Add(name, HttpContext.Current.Request.CurrentExecutionFilePath);
                    hashSessionTime.Add(name, DateTime.Now.Ticks);
                }
                else
                {
                    hashSessionState[name] = HttpContext.Current.Request.CurrentExecutionFilePath;
                    hashSessionTime[name] = DateTime.Now.Ticks;
                }
            }

            Session[name] = value;
        }

        public void CleanSession()
        {
            Hashtable hashSessionTime;
            Hashtable hashSessionState;
            IList<string> listKeysToRemove;

            if (Session[SessionTime] != null)
            {
                listKeysToRemove = new List<string>();
                hashSessionTime = (Hashtable)Session[SessionTime];
                hashSessionState = (Hashtable)Session[SessionState];

                foreach (DictionaryEntry item in hashSessionTime)
                {
                    long originalTicks = long.Parse(item.Value.ToString());
                    long elapsedTicks = DateTime.Now.Ticks - originalTicks;
                    TimeSpan elapsedSpan = new TimeSpan(elapsedTicks);

                    if (elapsedSpan.TotalMilliseconds > 300000)
                    {
                        listKeysToRemove.Add(item.Key.ToString());
                    }
                }

                foreach (string key in listKeysToRemove)
                {
                    hashSessionState.Remove(key);
                    hashSessionTime.Remove(key);
                    Session.Remove(key);
                }
            }
        }

        public string GetNombrePC()
        {
            string computerName = string.Empty;
            try
            {
                var host = new System.Net.IPHostEntry();
                host = System.Net.Dns.GetHostEntry(HttpContext.Current.Request.ServerVariables[REMOTE_HOST]);
                if (!string.IsNullOrEmpty(host.HostName))
                {
                    computerName = host.HostName;
                }
            }
            catch
            {
                computerName = HttpContext.Current.Request.ServerVariables[REMOTE_HOST];
            }

            if (string.IsNullOrWhiteSpace(computerName))
            {
                computerName = Environment.MachineName;
            }
            else
            {
                System.Net.IPAddress ipaddr = null;
                if (!System.Net.IPAddress.TryParse(computerName, out ipaddr))
                    computerName = computerName.Split(new Char[] { '.' })[0];
            }

            return computerName;
        }

        public string GetResourcesJSON()
        {
            var serializer = new JavaScriptSerializer();

            var recursos = DataTableToMap(ResourceManager.GetResourcesValues(LenguajeCode));

            return serializer.Serialize(recursos);
        }

        public string GetCommonResourcesJSON()
        {
            var serializer = new JavaScriptSerializer();

            var recursos = DataTableToMap(CommonResourceManager.GetResourcesValues(LenguajeCode));

            return serializer.Serialize(recursos);
        }

        public String LenguajeCode
        {
            get
            {
                return ToString(this.GetSession("LenguajeCode") == null ? "en" : this.GetSession("LenguajeCode"));
            }
        }

        public void Mensaje(string msj, int tipo)
        {
            System.Web.UI.ScriptManager.RegisterClientScriptBlock(this, this.GetType(), "Aviso", "Ex.mensajes('" + msj.Replace("'", "") + "'," + tipo + ");", true);
        }

        public static decimal? DecimalIsNull(string numero)
        {

            if (numero == "")
            {
                return null;
            }
            else
            {
                return decimal.Parse(numero);
            }
        }

        public static string ToString(object value)
        {
            if (value is DBNull)
                return string.Empty;

            return Convert.ToString(value);
        }

        public static int ToInt32(object value)
        {
            if (value is DBNull)
                return 0;

            return Convert.ToInt32(value);
        }

        public static decimal ToDecimal(object value)
        {
            if (value is DBNull)
                return 0;

            return Convert.ToDecimal(value);
        }

        public static bool ToBoolean(object value)
        {
            if (value is DBNull)
                return false;

            return Convert.ToBoolean(value);
        }

        public static DateTime ToDateTime(object value)
        {
            if (value is DBNull)
                return DateTime.MinValue;

            return Convert.ToDateTime(value);
        }

        public List<Dictionary<string, object>> DataTableToMap(DataTable p_dt)
        {
            List<Dictionary<string, object>> maps = new List<Dictionary<string, object>>();
            Dictionary<string, object> row;
            foreach (DataRow dr in p_dt.Rows)
            {
                row = new Dictionary<string, object>();
                foreach (DataColumn col in p_dt.Columns)
                {
                    row.Add(col.ColumnName, dr[col]);
                }
                maps.Add(row);
            }
            return maps;
        }

        public string SerializerJson(List<Dictionary<string, object>> a)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            return serializer.Serialize(a);
        }

        public List<Dictionary<string, string>> Deserialize(string json)
        {
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            List<Dictionary<string, string>> items = serializer.Deserialize<List<Dictionary<string, string>>>(json);
            return items;
        }

        public bool SendMail(string[] pMails, string pSubject, string pBody, bool isBodyHtml, string[] attachments, out string messageError)
        {
            return SendMail(pMails, new string[] { }, new string[] { }, pSubject, pBody, isBodyHtml, attachments, out messageError);
        } 

        public bool SendMail(string[] pMails, string[] pBccMails, string[] pCCMails, string pSubject, string pBody, bool isBodyHtml, string[] attachments, out string messageError)
        {
            messageError = string.Empty;
            if (ConfigurationManager.AppSettings["EnviaMail"] == null || ConfigurationManager.AppSettings["EnviaMail"] == "0")
            {
                messageError = "NO esta configurado el sistema para envio de correos, favor de verificar.";
                return false;
            }


            if (ConfigurationManager.AppSettings["EnviaMail"].ToString() == "1")
            {
                try
                {
                    SmtpClient objSendEmail = new SmtpClient(ConfigurationManager.AppSettings["ServerSMTP"]);
                    objSendEmail.Credentials = new NetworkCredential(ConfigurationManager.AppSettings["UserMail"].ToString(), ConfigurationManager.AppSettings["PasswordMail"].ToString());
                    MailMessage Message = new MailMessage();

                    Message.From = new MailAddress(ConfigurationManager.AppSettings["SenderEmail"], ConfigurationManager.AppSettings["SenderName"]);

                    string defaultStyles = " <style type=\"text/css\"> body, p, table, div, ul, li  {font-family:\"Verdana\", \"Arial\"; font-weight:normal; font-size:12px; } </style> ";

                    Message.Subject = pSubject;// "Encuesta pendiente";
                    //Para que tome en cuenta los TAGS de HTML
                    Message.IsBodyHtml = isBodyHtml;
                    Message.Body = defaultStyles + pBody;

                    //TO
                    foreach (string Email in pMails)
                    {
                        if (Email != "")
                            Message.To.Add(Email.Trim());
                    }

                    //BCC
                    foreach (string Email in pBccMails)
                    {
                        if (Email != "")
                            Message.Bcc.Add(Email.Trim());
                    }

                    //CC
                    foreach (string Email in pCCMails)
                    {
                        if (Email != "")
                            Message.CC.Add(Email.Trim());
                    } 
                    
                    foreach (string attachment in attachments)
                    {
                        if (attachment != "")
                        {
                            if (System.IO.File.Exists(attachment))
                            {
                                var attach = new System.Net.Mail.Attachment(attachment);
                                Message.Attachments.Add(attach);
                            }
                        }
                    }


                    objSendEmail.Send(Message);
                    return true;
                }
                catch (Exception ex)
                {
                    messageError = ex.Message;
                    return false;
                }
            }

            return false;
        }

        public IEnumerable<Control> GetAll(Control control, Type type)
        {
            var controls = control.Controls.Cast<Control>();

            return controls.SelectMany(ctrl => GetAll(ctrl, type))
                                      .Concat(controls)
                                      .Where(c => c.GetType() == type);
        }

        public static string Encripta(string Password)
        {
            string str1 = "";
            try
            {
                SHA1 shA1 = SHA1.Create();
                byte[] bytes = new ASCIIEncoding().GetBytes(Password);
                shA1.ComputeHash(bytes);
                str1 = Convert.ToBase64String(shA1.Hash);
            }
            catch (Exception ex)
            {
                string str2 = "Error in HashCode : " + ex.Message;
            }
            return str1;
        }

        protected DataTable HtmlEncodeStrings(DataTable dt)
        {
            List<string> ColsNames = dt.Columns.OfType<DataColumn>().Select<DataColumn, string>(col => col.ColumnName).ToList();
            foreach (string columnName in ColsNames)
            {
                string value = this.GetMessage(string.Format("{0}-{1}", dt.TableName, dt.Columns[columnName].ColumnName));
                dt.Columns[columnName].ColumnName = System.Web.HttpUtility.HtmlEncode(!string.IsNullOrEmpty(value) ? value : dt.Columns[columnName].ColumnName);
            }
            dt = HtmlEncodeStringsBody(dt);
            return dt;
        }

        protected DataTable HtmlEncodeStringsBody(DataTable dt)
        {
            foreach (DataRow row in dt.Rows)
            {
                foreach (DataColumn column in dt.Columns)
                {
                    if (column.DataType.Name.Equals("String"))
                    {
                        row[column] = System.Web.HttpUtility.HtmlEncode(row[column].ToString());
                    }
                }
            }
            return dt;
        } 
 
        private void DisableClientCaching()
        {
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            //Response.Headers.Add("Cache-Control", "no-cache, no-store");
            Response.Cache.SetExpires(DateTime.UtcNow.AddYears(-1));
            Response.Cache.SetNoStore();
        }

        public static void WriteLineOnTxt(String message)
        {
            string strFecha = DateTime.Now.ToString("ddMMyyyy");
            string url = System.Web.Hosting.HostingEnvironment.MapPath("~/Log/") + strFecha + ".txt";
            //path = path.Replace("file:\\", "").Replace("\\Debug", "");
            StreamWriter sw = new StreamWriter(url, true);
            // Agrega linea de Error.
            sw.WriteLine(message);
            sw.Flush();
            sw.Close();
        } 
    }
}