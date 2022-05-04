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
    public class FileUploadHandler : IHttpHandler, IRequiresSessionState
    {  
        public bool IsReusable
        {
            get { return true; }
        }

        public void ProcessRequest(HttpContext context)
        {
            HttpPostedFile hpf = context.Request.Files[0] as HttpPostedFile;


            if (hpf != null)
            {
                var fileName = Path.GetFileNameWithoutExtension(hpf.FileName) + Path.GetExtension(hpf.FileName);

                var _ext = Path.GetExtension(hpf.FileName).Substring(1);

                byte[] fileData = null;
                using (var binaryReader = new BinaryReader(hpf.InputStream))
                {
                    fileData = binaryReader.ReadBytes(hpf.ContentLength);
                }

                var AnexoActual = new AnexoInfo(fileName, hpf.ContentType, fileData, _ext);



                HttpContext.Current.Session[context.Request.QueryString["SessionName"].ToString()] = AnexoActual;
            }
        }

        public event EventHandler CountdownCompleted;

        protected virtual void OnCountdownCompleted(EventArgs e)
        {

        }

    }
}
