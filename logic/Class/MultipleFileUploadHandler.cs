using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

namespace logic.Class
{
    public class MultipleFileUploadHandler : IHttpHandler, IRequiresSessionState
    {  
        public bool IsReusable
        {
            get { return true; }
        }

        public void ProcessRequest(HttpContext context)
        {
            var respuesta = new Dictionary<object, object>();
            respuesta["Message"]  = string.Empty;
            respuesta["HasError"] = false; 
            try
            {
               
                if (context.Request.Files.Count > 0)
                {
                    var anexos = new List<AnexoInfo>();
                    var page = new BasePage(); 

                    if (HttpContext.Current.Session[context.Request.QueryString["SessionName"].ToString()] != null)
                    {
                        anexos = HttpContext.Current.Session[context.Request.QueryString["SessionName"].ToString()] as List<AnexoInfo>;
                    }

                    for (int i = 0; i < context.Request.Files.Count; i++)
                    {
                        HttpPostedFile hpf = context.Request.Files[i] as HttpPostedFile;
                        int fileID = Convert.ToInt32( context.Request.Form["FileID"].ToString() );

                        var maxImageSize = Convert.ToInt32(ConfigurationManager.AppSettings["MaxFileSize"]);
                        var imageSize = (float)hpf.ContentLength / 1000000;

                        if (imageSize > maxImageSize)
                        {
                            var msgErro = page.GetCommonMessage("msgMaxMB").Replace("{0}", maxImageSize.ToString());
                            throw new Exception(msgErro);
                        }

                        var esExisteArchivo = -1;
                        if (anexos != null && anexos.Count > 0)
                        {
                            var counter = 0;
                            foreach (AnexoInfo anexo in anexos)
                            {
                                //Ya existe el archivo en la sessión entonces lo actualizamos...
                                if (anexo._fileId == fileID)
                                {
                                    esExisteArchivo = counter;
                                    break;
                                }

                                counter = counter + 1;
                            }
                        }

                        if (hpf != null)
                        { 
                            var fileName = Path.GetFileNameWithoutExtension(hpf.FileName) + Path.GetExtension(hpf.FileName);

                            var _ext = Path.GetExtension(hpf.FileName).Substring(1);

                            byte[] fileData = null;
                            using (var binaryReader = new BinaryReader(hpf.InputStream))
                            {
                                fileData = binaryReader.ReadBytes(hpf.ContentLength);
                            }

                            var AnexoActual = new AnexoInfo(fileName, hpf.ContentType, fileData, _ext, fileID);

                            if (esExisteArchivo >= 0)
                            {
                                anexos[esExisteArchivo] = AnexoActual; 
                            }
                            else
                            {

                                anexos.Add(AnexoActual);
                            }
                        }
                    }

                    HttpContext.Current.Session[context.Request.QueryString["SessionName"].ToString()] = anexos;
                }
             }
             catch (Exception ex)
             {
                 respuesta["Message"] = ex.Message;
                 respuesta["HasError"] = true; 
             }

            var jSon = new JavaScriptSerializer() { MaxJsonLength = 2147483644 };
            context.Response.Write(jSon.Serialize(respuesta));
        }

        public event EventHandler CountdownCompleted;

        protected virtual void OnCountdownCompleted(EventArgs e)
        {

        } 
    }  
}
