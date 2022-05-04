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
using System.Net.Mime;
using System.Reflection;
using System.Web.Configuration;
using System.Web.Script.Serialization;
using System.Web.Security;
using logic.Common.Resources;
using System.Security.Cryptography;
using System.Xml.Serialization;
using NPOI.HSSF.Util;
using OfficeOpenXml;
using System.Xml.Linq; 

namespace logic
{
    public enum SessionStateModes
    {
        SinglePage = 0,
        AllPages = 1
    }

    public enum EstatusSolicitud
    {
        EnEjecucion=4,
        Pausado=14,
        Recuperado=15,
        EnMovimiento=16
    }

    public class BasePage : System.Web.UI.Page
    {
        

        public static string _Conexion;
        public static string _ConexionAuditSupport;
        public static string ConexionDB
        {
            get
            {
                if (_Conexion == null)
                {
                    _Conexion = ConfigurationManager.ConnectionStrings["connectionString"].ToString();
                }

                return _Conexion;
            }

        }

        public static string ConexionDBAuditSupport
        {
            get
            {
                if (_ConexionAuditSupport == null)
                {
                    _ConexionAuditSupport = ConfigurationManager.ConnectionStrings["ConexionAuditSupport"].ToString();
                }

                return _ConexionAuditSupport;
            }

        }

        //public static string _Conexion2;
        //public static string ConexionDB2
        //{
        //    get
        //    {
        //        if (_Conexion2 == null)
        //        {
        //            _Conexion2 = ConfigurationManager.ConnectionStrings["SqlSICE"].ToString();
        //        }

        //        return _Conexion2;
        //    }

        //}

        private const string SessionTime = "SessionTime";
        private const string SessionState = "SessionState";  
        private const string UidPage = "UidPage";
        public const string REMOTE_HOST = "REMOTE_HOST";
        private const string sessionCurrentModuloID = "sessionCurrentModuloID";
        private const string sessionDTpermisos = "DTpermisos";
        private const string sessionMenuPermisosItems = "sessionMenuPermisosItems";
        private const string sessionPermisosPantalla = "PermisosPantalla";

        KeyValuePlainTextResource resourceMgr, commonResourceMgr;  

        public DataTable PermisosPantalla
        {
            get { return this.GetSession(sessionPermisosPantalla) != null ? this.GetSession(sessionPermisosPantalla) as DataTable : new DataTable(); }
            set
            {
                this.SetSession(sessionPermisosPantalla, value, SessionStateModes.AllPages);
            }
        }

        public string Token
        {
            get { return this.GetSession("token") != null ? this.GetSession("token").ToString() : string.Empty; }
            set { this.SetSession("token", value, SessionStateModes.AllPages);
            }
        }

        public int CurrentModuloID
        {
            get { return HttpContext.Current.Session[sessionCurrentModuloID] != null ? Convert.ToInt32(HttpContext.Current.Session[sessionCurrentModuloID]) : 0; }
            internal set { HttpContext.Current.Session[sessionCurrentModuloID] = value; }
        }

        public string SqlLanguage
        {
            get
            {
                CultureInfo culture = this.Session["SESSION_CULTURE"] as CultureInfo;
                if (culture != null)
                {
                    return culture.TwoLetterISOLanguageName; 
                }

                return "es";
            }
        }

        public string NombrePcMod
        {
            get
            {
                string nombrePcMod = this.Session["NamePcMod"] as string;
                if (nombrePcMod == null)
                {
                    nombrePcMod = this.GetNombrePC();
                    this.Session["NamePcMod"] = nombrePcMod;
                }

                return nombrePcMod;
            }
        }

        protected string TypeName
        {
            get
            {
                string value = this.GetType().Name;
                if (!value.StartsWith("pages_"))
                    return string.Format("pages_{0}_aspx", value);
                else
                    return value;

            }
        }

        public KeyValuePlainTextResource ResourceManager
        {
            get
            {
                if (resourceMgr == null)
                    resourceMgr = ResourceFactory.CreateResource(this.TypeName, !IsPostBack, LenguajeCode);

                return resourceMgr;
            }
        }

        public String LenguajeCode
        {
            get
            {
                return this.GetSession("LenguajeCode") == null ? CultureInfo.CurrentCulture.TwoLetterISOLanguageName : ToString(this.GetSession("LenguajeCode"));
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

        public int ServicioID
        {
            get
            {
                //Cuando hereden del BaseMaster vamos y buscamos el valor del ServicioID de la master
                var masterPageBase = this.Page.Master as BaseMaster;

                if (masterPageBase != null)
                { 
                    return ToInt32(masterPageBase.ServicioID); 
                }
                else{
                    return ToInt32(this.GetAppSetting("ServicioID")); 
                }
            }
        }

        public int SocioID
        {
            get
            {
                return ToInt32(this.GetSession("UserId"));
            }
        }

        public delegate void LanguageChanged(CultureInfo cultureInfo);

        public event LanguageChanged LanguageChangedEvent;

        public delegate void OnPageRefresh(EventArgs e);

        public event OnPageRefresh OnPageRefreshEvent;
         

        public bool ValidaSessionActiva()
        { 
            if (HttpContext.Current.Session["UserId"] == null)
            {
                string msgError = this.CommonResourceManager.GetMessage("msgSinSesion") == null ? " -999.- La sesión ha caducado se requiere volver a iniciar sesión." : this.CommonResourceManager.GetMessage("msgSinSesion");
                throw new Exception(msgError);
            }

            return true;
        }

        public static void RenovateSession()
        {
            //if (HttpContext.Current.Session["Usuario"] == null)
            //{
            var Base = new BasePage();
            var a = new logic_acces(ConexionDB);
            var datos = new Dictionary<string, object>();
            datos["UsuarioRed"] = HttpContext.Current.User.Identity.Name;

            //DataTable dt = a.ExecuteQuery("UsuariosActivos_Get", datos).Tables[0];
            var ds = a.ExecuteQuery("UsuariosActivos_Get", datos);



            var usuarioDt = Base.DataTableToMap(ds.Tables[0]);

            if (usuarioDt.Count > 0)
            {
                var usuario = usuarioDt[0];
                HttpContext.Current.Session["UserId"] = usuario["UsuarioId"];
                HttpContext.Current.Session["Usuario"] = usuario;
                HttpContext.Current.Session["LenguajeCode"] = usuario["Code"];
                HttpContext.Current.Session["Theme"] = usuario["Theme"];
            }
            else
            {
                HttpContext.Current.Session["UserId"] = null;
                HttpContext.Current.Session["Usuario"] = null;
                HttpContext.Current.Session["Theme"] = null;
            }

            //}            
        }

        protected override void OnLoad(System.EventArgs e)
        { 
            //if (!this.Page.IsPostBack)
            //{
                var serializer = new JavaScriptSerializer();
                ValidaSeguridad();  
                var jsonRecursos = this.GetCommonResourcesJSON();
                this.RunJavascriptBeforeLoadPage("var recursosGlobal = jQuery.parseJSON('" + jsonRecursos + "');");
                jsonRecursos = this.GetResourcesJSON();
                this.RunJavascript("var recursos = jQuery.parseJSON('" + jsonRecursos + "');");
                
            //}
            
            base.OnLoad(e); 
        }
         
        protected override void OnPreInit(EventArgs e)
        {
            /* ScriptManager.RegisterClientScriptInclude(Page, typeof(Page), "jquery", this.URL + "scripts/carga.js?0404"); */
            Response.AppendHeader("X-UA-Compatible", "IE=edge,chrome=1");
            this.Theme = (HttpContext.Current.Session["Tema"] == null ? "Styles" : HttpContext.Current.Session["Tema"].ToString());
            /*
            if (Session["UserId"] == null)
            {
                string token = string.Empty; 
                this.Response.Redirect(this.URL + "pages/Login.aspx" + "?" + token + "ReturnUrl=" + this.Request.Url.PathAndQuery, true);
            }
            */
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

            if (!this.Page.IsPostBack)
            {
                
                if (HttpContext.Current.Session["UserId"] == null)
                {
                    try
                    {
                        //var a = new logic_acces(ConexionDB);
                        //Dictionary<string, string> datos = new Dictionary<string, string>();

                        //datos.Add("Login", this.Page.User.Identity.Name);

                        //DataTable dt = a.ExecuteQuery("JUPUserInfo_Sel", datos).Tables[0];

                        //if (dt.Rows.Count > 0)
                        //{
                        //    HttpContext.Current.Session["UserId"] = dt.Rows[0]["UsuarioId"];
                        //    HttpContext.Current.Session["LoginUser"] = this.Page.User.Identity.Name;
                        //    HttpContext.Current.Session["DefaultLanguageID"] = dt.Rows[0]["LanguageID"].ToString();
                        //}
                    }
                    catch (Exception ex)
                    {
                        var a = new logic_acces(ConexionDB);
                        Dictionary<string, string> datos = new Dictionary<string, string>();

                        datos.Add("Login", this.Page.User.Identity.Name);

                        DataTable dt = a.ExecuteQuery("DRPUserInfo_Sel", datos).Tables[0];

                        if (dt.Rows.Count > 0)
                        {
                            HttpContext.Current.Session["UserId"] = dt.Rows[0]["UsuarioId"];
                            HttpContext.Current.Session["LoginUser"] = this.Page.User.Identity.Name;
                            HttpContext.Current.Session["DefaultLanguageID"] = string.Empty;
                        }
                    }
                }
            }

            CultureManager.Initialize();
        }

        public string GetMessage(string resourceID)
        {
            return ResourceManager.GetMessage(resourceID);
        }

        public string GetCommonMessage(string resourceID)
        {
            return CommonResourceManager.GetMessage(resourceID);
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
                /*
                var host = new System.Net.IPHostEntry();
                host = System.Net.Dns.GetHostEntry(HttpContext.Current.Request.ServerVariables[REMOTE_HOST]);
                if (!string.IsNullOrEmpty(host.HostName))
                {
                    computerName = host.HostName;
                }
                */
                computerName = HttpContext.Current.Request.ServerVariables[REMOTE_HOST];
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

        public static DataTable GetDataTableFromDictionaries<T>(List<Dictionary<string, T>> list)
        {
            DataTable dataTable = new DataTable();

            if (list == null || !list.Any()) return dataTable;

            foreach (var column in list.First().Select(c => new DataColumn(c.Key, typeof(T))))
            {
                dataTable.Columns.Add(column);
            }

            foreach (var row in list.Select(
                r =>
                {
                    var dataRow = dataTable.NewRow();
                    r.ToList().ForEach(c => dataRow.SetField(c.Key, c.Value));
                    return dataRow;
                }))
            {
                dataTable.Rows.Add(row);
            }

            return dataTable;
        }

        public string SerializerJson(List<Dictionary<string, object>> a) {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer() { MaxJsonLength = 2147483644 };
            return serializer.Serialize(a);
        }

        public string SerializerJson(string a)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            return serializer.Serialize(a);
        }

        public List<Dictionary<string, string>> Deserialize(string json) 
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            List<Dictionary<string, string>> items = serializer.Deserialize<List<Dictionary<string, string>>>(json);
            return items;
        }

        public List<Dictionary<string, object>> DeserializeObject(string json)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            List<Dictionary<string, object>> items = serializer.Deserialize<List<Dictionary<string, object>>>(json);
            return items;
        }

        public List<Dictionary<string, object>> GetCommonResources()
        {
            var serializer = new JavaScriptSerializer();

            var recursos = DataTableToMap(CommonResourceManager.GetResourcesValues(LenguajeCode));

            return recursos;
        }

        public bool SendMail(string[] pMails, string pSubject, string pBody, bool isBodyHtml, string[] attachments, out string messageError, AlternateView avBody = null)
        {
            return SendMail(pMails, new string[] { }, new string[] { }, pSubject, pBody, isBodyHtml, attachments, out messageError, null, avBody);
        }

        public bool SendMail(string[] pMails, string[] pBccMails, string[] pCCMails, string pSubject, string pBody, bool isBodyHtml, string[] attachments, out string messageError, AlternateView avBody = null)
        {
            return SendMail(pMails, pBccMails, pCCMails, pSubject, pBody, isBodyHtml, attachments, out messageError, null, avBody);
        }
        
        public bool SendMail(string[] pMails, string[] pBccMails, string[] pCCMails, string pSubject, string pBody, bool isBodyHtml, string[] attachments, out string messageError, Dictionary<string, Stream>  stearmAttachments, AlternateView avBody = null)
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
                    //objSendEmail.EnableSsl = Convert.ToBoolean(ConfigurationManager.AppSettings["EnableSsl"]);
                    //objSendEmail.Port = int.Parse(ConfigurationManager.AppSettings["SmtpPort"].ToString());
                    Message.From = new MailAddress(ConfigurationManager.AppSettings["SenderEmail"], ConfigurationManager.AppSettings["SenderName"]);
                    
                    string defaultStyles = " <style type=\"text/css\"> " +
                                           "body, p, table, div, ul, li  {font-family:\"Verdana\", \"Arial\"; font-weight:normal; font-size:12px; }" +
                                           ".ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td {line-height: 100%}" +
                                           "</style> ";

                    Message.Subject = pSubject;// "Encuesta pendiente";
                    //Para que tome en cuenta los TAGS de HTML
                    Message.IsBodyHtml = isBodyHtml;
                    
                    if (avBody != null)
                    {
                        Message.AlternateViews.Add(avBody);
                    }
                    else
                    {
                        Message.Body = defaultStyles + pBody;
                    }
                 
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

                    if (stearmAttachments != null)
                    {
                        foreach (var attachment in stearmAttachments)
                        {
                            var attach = new System.Net.Mail.Attachment((Stream)attachment.Value, attachment.Key);
                            Message.Attachments.Add(attach);
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

        public bool SendMailContacto(Dictionary<string,object> datos, AlternateView avBody )
        {
            if (ConfigurationManager.AppSettings["EnviaMail"].ToString() == "1")
            {
                var mensaje = "Correo Receptor: " + datos["ReceiverEmail"].ToString() + ", Usuario Remitente: " + datos["SenderName"] + ", Correo Remitente: " + datos["SenderEmail"];
                var contenidoMensaje = "Asunto: " + datos["Subject"].ToString() + ", Mensaje: " + datos["Body"].ToString();
                try
                {
                    SmtpClient objSendEmail = new SmtpClient(ConfigurationManager.AppSettings["ServerSMTP"]);
                    objSendEmail.Credentials = new NetworkCredential(ConfigurationManager.AppSettings["UserMail"].ToString(), ConfigurationManager.AppSettings["PasswordMail"].ToString());
                    MailMessage Message = new MailMessage();
                    Message.From = new MailAddress(ConfigurationManager.AppSettings["SenderEmail"], ConfigurationManager.AppSettings["SenderName"]);

                    //objSendEmail.EnableSsl = Convert.ToBoolean(ConfigurationManager.AppSettings["EnableSsl"]);

                    Message.Subject = datos["Subject"].ToString();// "Encuesta pendiente";
                    //Para que tome en cuenta los TAGS de HTML
                    Message.IsBodyHtml = true;
                    Message.Body = datos["Body"].ToString();

                    Message.AlternateViews.Add(avBody);
                    if (datos["ReceiverEmail"].ToString() != "")
                    {
                        Message.To.Add(datos["ReceiverEmail"].ToString());
                    }

                    objSendEmail.Send(Message);


                    prueba(mensaje, "", contenidoMensaje, true);
                    return true;
                }
                catch (Exception ex)
                {
                    prueba(mensaje, ex.Message + "|" + ex.StackTrace, contenidoMensaje, false);
                    return false;
                }
            }
            else
            {
                return false;
            }
        }

        private void prueba(string mensaje,string mensaje2,string contenidoMensaje,bool enviado)
        {
            var a = new logic_acces(ConexionDB, false);
            var datos = new Dictionary<string, object>();
            datos.Add("CorreosDestinatarios", mensaje);
            datos.Add("Enviado", enviado);
            datos.Add("MensajeError", mensaje2);
            datos.Add("ContenidoMensaje", contenidoMensaje);

            a.ExecuteNonQuery("LogCorreo_I", datos);
        }
       
        public bool SendMail(string[] pMails, string[] pBccMails, string[] pCCMails, string pSubject, string pBody, bool isBodyHtml, string[] attachments, out string messageError, Dictionary<string, Stream> stearmAttachments, Dictionary<string, string> settings)
        {
            messageError = string.Empty;

            
            if (settings["EnviaMail"] == null || settings["EnviaMail"] == "0")
            {
                messageError = "NO esta configurado el sistema para envio de correos, favor de verificar.";
                return false;
            }


            if (settings["EnviaMail"].ToString() == "1")
            {
                try
                {
                    SmtpClient objSendEmail = new SmtpClient(settings["ServerSMTP"]);
                    objSendEmail.Credentials = new NetworkCredential(settings["UserMail"].ToString(), settings["PasswordMail"].ToString());
                    MailMessage Message = new MailMessage();
                    //objSendEmail.EnableSsl = Convert.ToBoolean(ConfigurationManager.AppSettings["EnableSsl"]);
                    //objSendEmail.Port = int.Parse(ConfigurationManager.AppSettings["SmtpPort"].ToString());
                    Message.From = new MailAddress(settings["SenderEmail"], settings["SenderName"]);

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

                    if (stearmAttachments != null)
                    {
                        foreach (var attachment in stearmAttachments)
                        {
                            var attach = new System.Net.Mail.Attachment((Stream)attachment.Value, attachment.Key);
                            Message.Attachments.Add(attach);
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

        public static string SerializeOne(Dictionary<string, string> a)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            return serializer.Serialize(a);
        }

        public static string SerializeOne(Dictionary<string, object> a)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            return serializer.Serialize(a);
        }

        public static Dictionary<string, string> DeserializeOne(string json)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            Dictionary<string, string> items = serializer.Deserialize<Dictionary<string, string>>(json);
            return items;
        }

        public static Dictionary<string, object> DeserializeOne2(string json)
        {
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            Dictionary<string, object> items = serializer.Deserialize<Dictionary<string, object>>(json);
            return items;
        }
         
        public static string[] DeserializeArray(string json)
        {
            return new JavaScriptSerializer().Deserialize<string[]>(json);
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

        protected DataTable SetColumnsName(DataTable dt)
        {
            List<string> ColsNames = dt.Columns.OfType<DataColumn>().Select<DataColumn, string>(col => col.ColumnName).ToList();
            foreach (string columnName in ColsNames)
            {
                string value =  this.GetMessage(string.Format("{0}-{1}", dt.TableName, dt.Columns[columnName].ColumnName));
                dt.Columns[columnName].ColumnName = System.Web.HttpUtility.HtmlDecode(!string.IsNullOrEmpty(value) ? value : dt.Columns[columnName].ColumnName);
            }
             
            return dt;
        }  

        public static T XmlDeserializeFromString<T>(string objectData)
        {
            return (T)XmlDeserializeFromString(objectData, typeof(T));
        }

        public static object XmlDeserializeFromString(string objectData, Type type)
        {
            var serializer = new XmlSerializer(type);
            object result;

            using (TextReader reader = new StringReader(objectData))
            {
                result = serializer.Deserialize(reader);
            }

            return result;
        } 


        public void ValidaSeguridad()
        {
            
        } 

        public bool HasSpecialPermission(int optionID )
        {
            var a = new logic_acces(ConexionDB);
            Dictionary<string, string> datos = new Dictionary<string, string>();

            datos.Add("Login", "");
            datos.Add("OpcionID", optionID.ToString());
            if (HttpContext.Current.Session["LoginUser"] != null)
            {
                datos["Login"] = HttpContext.Current.Session["LoginUser"].ToString();
            }

            var dt = a.ExecuteQuery("DRPUserOption_Sel", datos).Tables[0];

            return  dt.Rows[0]["TienePermiso"].ToString() == "1" ? true : false;
        }

        private void DisableClientCaching()
        { 
            Response.Cache.SetCacheability(HttpCacheability.NoCache); 
            //Response.Headers.Add("Cache-Control", "no-cache, no-store"); 
            Response.Cache.SetExpires(DateTime.UtcNow.AddYears(-1));
            Response.Cache.SetNoStore();
        }
         
        public byte[] ExportToExcel(DataTable dt)
        {
            var pck = new ExcelPackage(new FileInfo(HttpContext.Current.Server.MapPath("~/Templates/Default_Layout.xlsx")), true);
            var ws = pck.Workbook.Worksheets[1];


            var columnas = new List<string>();

            int i = 2;
            int col = 2;


            foreach (DataColumn column in dt.Columns)
            {
                string value = this.GetMessage(string.Format("{0}-{1}", dt.TableName, column.ColumnName));

                if (!string.IsNullOrEmpty(value))
                {
                    ws.Cells[i, col].Value = value;
                    columnas.Add(column.ColumnName);
                    col = col + 1;
                }
            }

            i = 3;

            foreach (DataRow item in dt.Rows)
            {
                int col2 = 2;

                foreach (string columnName in columnas)
                {
                    ws.Cells[i, col2].Value = item[columnName];
                    col2 = col2 + 1;
                }

                i++;
            }
            return pck.GetAsByteArray();
        }

        public byte[] ExportToExcel(DataTable dt, DataTable dt2)
        {
            var pck = new ExcelPackage(new FileInfo(HttpContext.Current.Server.MapPath("~/Templates/Default_Layout_Doble.xlsx")), true);
            var ws = pck.Workbook.Worksheets[1];


            var columnas = new List<string>();

            int i = 2;
            int col = 2;


            foreach (DataColumn column in dt.Columns)
            {
                string value = this.GetMessage(string.Format("{0}-{1}", dt.TableName, column.ColumnName));

                if (!string.IsNullOrEmpty(value))
                {
                    ws.Cells[i, col].Value = value;
                    columnas.Add(column.ColumnName);
                    col = col + 1;
                }
            }

            i = 3;

            foreach (DataRow item in dt.Rows)
            {
                int col2 = 2;

                foreach (string columnName in columnas)
                {
                    ws.Cells[i, col2].Value = item[columnName];
                    col2 = col2 + 1;
                }

                i++;
            }


            ws = pck.Workbook.Worksheets[2];


            columnas = new List<string>();

            i = 2;
            col = 2;


            foreach (DataColumn column in dt2.Columns)
            {
                string value = this.GetMessage(string.Format("{0}-{1}", dt2.TableName, column.ColumnName));

                if (!string.IsNullOrEmpty(value))
                {
                    ws.Cells[i, col].Value = value;
                    columnas.Add(column.ColumnName);
                    col = col + 1;
                }
            }

            i = 3;

            foreach (DataRow item in dt2.Rows)
            {
                int col2 = 2;

                foreach (string columnName in columnas)
                {
                    ws.Cells[i, col2].Value = item[columnName];
                    col2 = col2 + 1;
                }

                i++;
            }

            return pck.GetAsByteArray();
        }

        public static string DirectoryToXML(List<Dictionary<string, string>> registrosActuales)
        {
            string xmlStr = "<root></root>";

            if (registrosActuales.Count > 0)
            {
                xmlStr = "<root>";

                var dictionaryPaso = new Dictionary<string, string>();

                foreach (Dictionary<string, string> item in registrosActuales)
                {

                    dictionaryPaso = new Dictionary<string, string>();

                    foreach (var key in item)
                    {
                        if (!key.Key.Contains("$$"))
                        {  
                            dictionaryPaso.Add(key.Key,HttpUtility.HtmlEncode( key.Value));
                        }
                    }

                    XElement el = new XElement("item", dictionaryPaso.Select(kv => new XElement(kv.Key, kv.Value)));
                    xmlStr = xmlStr + el.ToString();
                }

                xmlStr = xmlStr + "</root>";

            }

            return xmlStr;
        }
         
        public static string DirectoryToXML(List<Dictionary<string, object>> registrosActuales, bool encode = true)
        {
            string xmlStr = "<root></root>";

            if (registrosActuales.Count > 0)
            {
                xmlStr = "<root>";

                var dictionaryPaso = new Dictionary<string, object>();

                foreach (Dictionary<string, object> item in registrosActuales)
                {

                    dictionaryPaso = new Dictionary<string, object>();

                    foreach (var key in item)
                    {
                        if (!key.Key.Contains("$$"))
                        {
                            if (encode)
                            {
                                dictionaryPaso.Add(key.Key, HttpUtility.HtmlEncode(key.Value));
                            }
                            else
                            {
                                dictionaryPaso.Add(key.Key, key.Value);
                            }

                        }
                    }

                    XElement el = new XElement("item", dictionaryPaso.Select(kv => new XElement(kv.Key, kv.Value)));
                    xmlStr = xmlStr + el.ToString();
                }

                xmlStr = xmlStr + "</root>";

            }

            return xmlStr;
        }

        public static DataTable ToDataTable<T>(List<T> items)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);

            //Get all the properties
            PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in Props)
            {
                //Defining type of data column gives proper data table 
                var type = (prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>) ? Nullable.GetUnderlyingType(prop.PropertyType) : prop.PropertyType);
                //Setting column names as Property names
                dataTable.Columns.Add(prop.Name, type);
            }
            foreach (T item in items)
            {
                var values = new object[Props.Length];
                for (int i = 0; i < Props.Length; i++)
                {
                    //inserting property values to datatable rows
                    values[i] = Props[i].GetValue(item, null);
                }
                dataTable.Rows.Add(values);
            }
            //put a breakpoint here and check datatable
            return dataTable;
        }

        private const int Keysize = 256;
        private const int DerivationIterations = 1000;
        public string Encrypt(string plainText, string passPhrase = "Exertus")
        {
            // Salt and IV is randomly generated each time, but is preprended to encrypted cipher text
            // so that the same Salt and IV values can be used when decrypting.  
            var saltStringBytes = Generate256BitsOfRandomEntropy();
            var ivStringBytes = Generate256BitsOfRandomEntropy();
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            using (var password = new Rfc2898DeriveBytes(passPhrase, saltStringBytes, DerivationIterations))
            {
                var keyBytes = password.GetBytes(Keysize / 8);
                using (var symmetricKey = new RijndaelManaged())
                {
                    symmetricKey.BlockSize = 256;
                    symmetricKey.Mode = CipherMode.CBC;
                    symmetricKey.Padding = PaddingMode.PKCS7;
                    using (var encryptor = symmetricKey.CreateEncryptor(keyBytes, ivStringBytes))
                    {
                        using (var memoryStream = new MemoryStream())
                        {
                            using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                            {
                                cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
                                cryptoStream.FlushFinalBlock();
                                // Create the final bytes as a concatenation of the random salt bytes, the random iv bytes and the cipher bytes.
                                var cipherTextBytes = saltStringBytes;
                                cipherTextBytes = cipherTextBytes.Concat(ivStringBytes).ToArray();
                                cipherTextBytes = cipherTextBytes.Concat(memoryStream.ToArray()).ToArray();
                                memoryStream.Close();
                                cryptoStream.Close();
                                return Convert.ToBase64String(cipherTextBytes);
                            }
                        }
                    }
                }
            }
        }

        public string Decrypt(string cipherText, string passPhrase = "Exertus")
        {

            cipherText = cipherText.Replace(" ", "+");
            // Get the complete stream of bytes that represent:
            // [32 bytes of Salt] + [32 bytes of IV] + [n bytes of CipherText]
            var cipherTextBytesWithSaltAndIv = Convert.FromBase64String(cipherText);
            // Get the saltbytes by extracting the first 32 bytes from the supplied cipherText bytes.
            var saltStringBytes = cipherTextBytesWithSaltAndIv.Take(Keysize / 8).ToArray();
            // Get the IV bytes by extracting the next 32 bytes from the supplied cipherText bytes.
            var ivStringBytes = cipherTextBytesWithSaltAndIv.Skip(Keysize / 8).Take(Keysize / 8).ToArray();
            // Get the actual cipher text bytes by removing the first 64 bytes from the cipherText string.
            var cipherTextBytes = cipherTextBytesWithSaltAndIv.Skip((Keysize / 8) * 2).Take(cipherTextBytesWithSaltAndIv.Length - ((Keysize / 8) * 2)).ToArray();

            using (var password = new Rfc2898DeriveBytes(passPhrase, saltStringBytes, DerivationIterations))
            {
                var keyBytes = password.GetBytes(Keysize / 8);
                using (var symmetricKey = new RijndaelManaged())
                {
                    symmetricKey.BlockSize = 256;
                    symmetricKey.Mode = CipherMode.CBC;
                    symmetricKey.Padding = PaddingMode.PKCS7;
                    using (var decryptor = symmetricKey.CreateDecryptor(keyBytes, ivStringBytes))
                    {
                        using (var memoryStream = new MemoryStream(cipherTextBytes))
                        {
                            using (var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                            {
                                var plainTextBytes = new byte[cipherTextBytes.Length];
                                var decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
                                memoryStream.Close();
                                cryptoStream.Close();
                                return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
                            }
                        }
                    }
                }
            }
        }

        private static byte[] Generate256BitsOfRandomEntropy()
        {
            var randomBytes = new byte[32]; // 32 Bytes will give us 256 bits.
            using (var rngCsp = new RNGCryptoServiceProvider())
            {
                // Fill the array with cryptographically secure random bytes.
                rngCsp.GetBytes(randomBytes);
            }
            return randomBytes;
        }

        public string AppTheme()
        {
            RenovateSession();
            //var cCollection = Request.Cookies;
            //HttpCookie cTheme = cCollection.Get("AppTheme");
            //if (cTheme == null)
            //{
            //    cTheme = new HttpCookie("AppTheme");
            //    cTheme.Value = "RM";
            //    cTheme.Expires = DateTime.Now.AddYears(1);
            //    Response.Cookies.Add(cTheme);
            //}

            //return cTheme.Value;
            return HttpContext.Current.Session["Theme"] == null ? "RM" : HttpContext.Current.Session["Theme"].ToString();
        }
    } 

}
