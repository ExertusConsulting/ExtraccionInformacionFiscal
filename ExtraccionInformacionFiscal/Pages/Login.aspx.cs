using logic;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace ExtraccionInformacionFiscal.Pages
{
    public partial class Login : BasePage
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        [WebMethod(EnableSession = true)]
        [ScriptMethod]
        static public string ValidaRFC(Dictionary<string, object> datos)
        {
            try
            {
                var a = new logic_acces(ConexionDB);
                a.ExecuteNonQuery("ValidaRFC_Get", datos);
                return null;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
            
        }


        [WebMethod(EnableSession = true)]
        [ScriptMethod]
        static public Dictionary<string, object> EnviaMensaje(Dictionary<string, object> datos)
        {
            try
            {
                var mensaje = ConfigurationManager.AppSettings["OTPMensaje"].ToString();
                var index = mensaje.IndexOf("[code]");
                var url = ConfigurationManager.AppSettings["OTPUrlApiSend"].ToString();
                var token = ConfigurationManager.AppSettings["OTPToken"].ToString();
                var sender = ConfigurationManager.AppSettings["OTPSender"].ToString();
                
                var queryString = "?auth=" + token + "&phone=" + datos["telefono"] + "&msg=" + mensaje + "&sender=" + sender;
                url = url + queryString;
                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);

                request.ContentType = "application/json";
                request.Method = "GET";

                var response = (HttpWebResponse)request.GetResponse();

                StreamReader sr = new StreamReader(response.GetResponseStream());

                var result = sr.ReadToEnd();

                //var result = "{'status': true,'description': {'number': '8117435915','message': 'Bienvenido a contacta su codigo es 416465','country': {'country': 'MEXICO','iso_code': 'MX','type': 'MOVIL'},'charge': 0.27,'added_on': '2022-04-22 12:36:43','id': '41002777','sender': 'HEINEKENMX'},'error': false}";
                JObject value = new JObject();
                var parsed = JObject.Parse(result);
                var codigo = parsed["description"]["message"].ToString();
                codigo = codigo.Substring(index, 6);
                datos["status"] = Convert.ToBoolean( parsed["status"]);
                datos["error"] = Convert.ToBoolean(parsed["error"]);
                return datos;
            }
            catch (Exception ex)
            {
                datos["status"] = false;
                return datos;
            }
        }

        [WebMethod(EnableSession = true)]
        [ScriptMethod]
        static public Dictionary<string, object> ValidaOTP(Dictionary<string, object> datos)
        {
            try
            {
                var url = ConfigurationManager.AppSettings["OTPUrlApiVerify"].ToString();
                var token = ConfigurationManager.AppSettings["OTPToken"].ToString();

                var queryString = "?auth=" + token + "&phone=" + datos["telefono"] + "&otp=" + datos["codigo"];
                url = url + queryString;
                HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(url);

                request.ContentType = "application/json";
                request.Method = "GET";

                var response = (HttpWebResponse)request.GetResponse();

                StreamReader sr = new StreamReader(response.GetResponseStream());

                var result = sr.ReadToEnd();
                //var result = "{ 'status': true,'description': 'the phone requested has been verified correctly','error': false}";
                JObject value = new JObject();
                var parsed = JObject.Parse(result);
                datos["status"] =  Convert.ToBoolean(parsed["status"]);
                return datos;
            }
            catch (Exception ex)
            {
                //throw new Exception(ex.Message + "|" + ex.StackTrace);
                datos["status"] = false;
                return datos;
            }
            
        }

        [WebMethod(EnableSession = true)]
        [ScriptMethod]
        static public void AceptarAviso(Dictionary<string, object> datos)
        {
            HttpContext.Current.Session["usuarioLoggeado"] = datos["rfc"];   
        }

    }
}