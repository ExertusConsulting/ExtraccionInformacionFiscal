using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.SessionState;

namespace logic.Class
{
    public class ImageLoader : IHttpHandler, IRequiresSessionState
    { 
        public string ruta = string.Empty;

        public static string _Conexion;

        public static string ConexionDB
        {
            get
            {
                if (_Conexion == null)
                {
                    _Conexion = ConfigurationManager.ConnectionStrings["Conexion"].ToString();
                }

                return _Conexion;
            }

        }

        public bool IsReusable
        {
            get { return true; }
        }

        public void ProcessRequest(HttpContext context)
        {
            if (context.Request.QueryString["NoticiaID"] != null)
            {
                var page = new BasePage();

                var a = new logic_acces(ConexionDB);

                Dictionary<string, string> datos = new Dictionary<string, string>();
                datos.Add("NoticiaID", context.Request.QueryString["NoticiaID"].ToString());

                DataTable dt = a.ExecuteQuery("MainNoticiaById_sel", datos).Tables[0];
                
                var rutaArchivo = string.Empty;
                if (dt.Rows.Count > 0){
                    rutaArchivo = dt.Rows[0]["RutaArchivo"].ToString();
                }

                if (File.Exists(rutaArchivo))
                {
                    var fs = System.IO.File.Open(rutaArchivo, System.IO.FileMode.Open);
                    byte[] bytes = new byte[fs.Length];
                    fs.Read(bytes, 0, Convert.ToInt32(fs.Length));
                    fs.Close();
                    if (bytes != null)
                    {
                        context.Response.ContentType = "image/";
                        context.Response.BinaryWrite(bytes); 
                        context.Response.End();
                    }
                } 
            }

            if (context.Request.QueryString["IconID"] != null)
            {
                var page = new BasePage();

                var a = new logic_acces(ConexionDB);

                Dictionary<string, string> datos = new Dictionary<string, string>();
                datos.Add("IconID", context.Request.QueryString["IconID"].ToString());

                DataTable dt = a.ExecuteQuery("MainIcon_sel", datos).Tables[0];
                
                var rutaArchivo = string.Empty;
                if (dt.Rows.Count > 0){
                    rutaArchivo = dt.Rows[0]["RutaArchivo"].ToString();
                }

                if (File.Exists(rutaArchivo))
                {
                    var fs = System.IO.File.Open(rutaArchivo, System.IO.FileMode.Open);
                    byte[] bytes = new byte[fs.Length];
                    fs.Read(bytes, 0, Convert.ToInt32(fs.Length));
                    fs.Close();
                    if (bytes != null)
                    {
                        context.Response.ContentType = "image/";
                        context.Response.BinaryWrite(bytes); 
                        context.Response.End();
                    }
                } 
            }

            if (context.Request.QueryString["PrestacionID"] != null)
            {
                var page = new BasePage();

                var a = new logic_acces(ConexionDB);

                Dictionary<string, string> datos = new Dictionary<string, string>();
                datos.Add("PrestacionID", context.Request.QueryString["PrestacionID"].ToString());

                DataTable dt = a.ExecuteQuery("dbo.prePrestaciones_Sel", datos).Tables[0];

                var rutaArchivo = string.Empty;
                if (dt.Rows.Count > 0)
                {
                    rutaArchivo = dt.Rows[0]["RutaArchivo"].ToString();
                }
                
                //Si es no tiene imagen sacamos una imagen de default
                if (string.IsNullOrEmpty(rutaArchivo))
                {
                    rutaArchivo = string.Format("{0}{1}\\{2}.png", System.AppDomain.CurrentDomain.BaseDirectory, "Templates", "Prestacion-Icono-Default");
                }

                if (File.Exists(rutaArchivo))
                {
                    var fs = System.IO.File.Open(rutaArchivo, System.IO.FileMode.Open);
                    byte[] bytes = new byte[fs.Length];
                    fs.Read(bytes, 0, Convert.ToInt32(fs.Length));
                    fs.Close();
                    if (bytes != null)
                    {
                        context.Response.ContentType = "image/";
                        context.Response.BinaryWrite(bytes);
                        context.Response.End();
                    }
                }
            }

            if (context.Request.QueryString["SessionName"] != null)
            {
                if (HttpContext.Current.Session[context.Request.QueryString["SessionName"].ToString()] != null)
                {
                    var archivo = (AnexoInfo)HttpContext.Current.Session[context.Request.QueryString["SessionName"].ToString()];

                    if (archivo._source != null)
                    {
                        context.Response.ContentType = "image/";
                        context.Response.BinaryWrite(archivo._source);
                        context.Response.End();
                    }
                }
            } 
        }
    }
}
