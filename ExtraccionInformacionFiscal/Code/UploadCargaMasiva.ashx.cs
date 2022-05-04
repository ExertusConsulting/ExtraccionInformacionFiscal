using logic;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ExtraccionInformacionFiscal.Code
{
    /// <summary>
    /// Summary description for UploadCargaMasiva
    /// </summary>
    public class UploadCargaMasiva : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            var result = new List<Dictionary<string, object>>();
            context.Response.ContentType = "text/json";
            System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer() { MaxJsonLength = 2147483644 };
            try
            {
                
                
                if (context.Request.Files.Count > 0)
                {
                    result = ReadExcel(context);

                    foreach (var item in result.Where(a => !Convert.ToBoolean(a["ErrorURL"])))
                    {
                        try
                        {
                            _Default.Guardar(item);
                        }
                        catch (Exception ex)
                        {
                            item["ErrorURL"] = true;
                            item["MensajeError"] = ex.Message;
                        }

                    }
                    var response = serializer.Serialize(new
                    {
                        PersonasFisicas = result.Where(a => a["TipoPersona"].ToString() == "Física")
                    });

                    context.Response.Write(response);
                }

            }
            catch (Exception ex)
            {
                var row = new Dictionary<string, object>();
                row["ErrorURL"] = true;
                row["MensajeError"] = ex.Message + " | " + ex.StackTrace;
                result.Add(row);
                var response = serializer.Serialize(new
                {
                    PersonasFisicas = result,
                });

                context.Response.Write(response);
            }
            
            
        }

        

        private List<Dictionary<string, object>> ReadExcel(HttpContext context)
        {
            ExcelPackage datosExcel = new ExcelPackage();
            HttpPostedFile archivo = context.Request.Files[0];
            datosExcel = new ExcelPackage(archivo.InputStream);
            ExcelWorksheet ws = datosExcel.Workbook.Worksheets[1];
            var finFilas = ws.Dimension.End.Row;
            var lista = new List<Dictionary<string, object>>();
            var rfcsProcesados = new List<string>();
            
            for (var i = 2; i <= finFilas; i++)
            {
                if (string.IsNullOrEmpty(BasePage.ToString(ws.Cells[i, 1].Value)) && string.IsNullOrEmpty(BasePage.ToString(ws.Cells[i, 2].Value)))
                {
                    break;
                }

                var parameters = new Dictionary<string, object>();

                parameters["rfc"] = ws.Cells[i, 1].Value ?? "";
                parameters["cfdi"] = ws.Cells[i, 2].Value ?? "";
                parameters["usoCfdi"] = ws.Cells[i, 3].Value ?? "";
                parameters["esMasivo"] = true;
                rfcsProcesados.Add(parameters["rfc"].ToString().Trim().ToLower());
                var result = _Default.LeerPaginaSAT(parameters);
                var mensaje = "";
                var errorURL = false;
                if (parameters["rfc"].ToString().Length > 16)
                {
                    errorURL = true;
                    mensaje = "La longitud del RFC excede el máximo esperado (16)<br />";
                    
                }

                if (parameters["cfdi"].ToString().Length > 11)
                {
                    errorURL = true;
                    mensaje += "La longitud del idCIF excede el máximo esperado (11)<br />";
                }

                if (parameters["usoCfdi"].ToString().Length > 3)
                {
                    errorURL = true;
                    mensaje += "La longitud del Uso de CFDI excede el máximo esperado (3)<br />";
                }

                if (rfcsProcesados.Where(a => a == parameters["rfc"].ToString().Trim().ToLower()).Count()>1)
                {
                    errorURL = true;
                    mensaje += "El RFC Está duplicado (" +parameters["rfc"].ToString()+ ")<br />";
                }

                if (errorURL)
                {
                    result["ErrorURL"] = true;
                    if(result["MensajeError"].ToString()!="")
                        result["MensajeError"] = result["MensajeError"] + "<br />" + mensaje;
                    else
                        result["MensajeError"] = mensaje;
                }

                lista.Add(result);

            }

            return lista;
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}