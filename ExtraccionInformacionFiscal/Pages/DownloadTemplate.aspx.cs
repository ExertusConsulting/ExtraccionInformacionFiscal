using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace ExtraccionInformacionFiscal.Pages
{
    public partial class DownloadTemplate : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            var path = HttpContext.Current.Server.MapPath(ConfigurationManager.AppSettings["TemplateCargaMasiva"]);
            Byte[] bytes = File.ReadAllBytes(path);
            HttpContext.Current.Response.AddHeader("Content-disposition", "attachment; filename=CargaMasiva.xlsx" );
            HttpContext.Current.Response.ContentType = ".xlsx";
            HttpContext.Current.Response.BinaryWrite(bytes);
            HttpContext.Current.Response.End();
        }
    }
}