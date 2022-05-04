using ExtraccionInformacionFiscal.Code;
using logic;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace ExtraccionInformacionFiscal
{
    public partial class _Default : BasePage
    {
        private static logic.BasePage Base = new BasePage();
        private static List<CamposSAT> camposSat = new List<CamposSAT>()
        {
            new CamposSAT(){ CampoSAT="denominación o razón social"           ,CampoAPP="RazonSocial",TipoPersona=TipoPersona.Moral}               ,
            new CamposSAT(){ CampoSAT="régimen de capital"                    ,CampoAPP="RegimenCapital",TipoPersona=TipoPersona.Moral}            ,
            new CamposSAT(){ CampoSAT="fecha de constitución"                 ,CampoAPP="FechaConstitucion",TipoPersona=TipoPersona.Moral}         ,
            new CamposSAT(){ CampoSAT="curp"                                  ,CampoAPP="CURP",TipoPersona=TipoPersona.Fisica}                      ,
            new CamposSAT(){ CampoSAT="nombre"                                ,CampoAPP="Nombre",TipoPersona=TipoPersona.Fisica}                    ,
            new CamposSAT(){ CampoSAT="apellido paterno"                      ,CampoAPP="ApellidoPaterno",TipoPersona=TipoPersona.Fisica}           ,
            new CamposSAT(){ CampoSAT="apellido materno"                      ,CampoAPP="ApellidoMaterno",TipoPersona=TipoPersona.Fisica}           ,
            new CamposSAT(){ CampoSAT="fecha nacimiento"                      ,CampoAPP="FechaNacimiento",TipoPersona=TipoPersona.Fisica}           ,
            new CamposSAT(){ CampoSAT="fecha de inicio de operaciones"        ,CampoAPP="FechaInicioOperaciones",TipoPersona=TipoPersona.Ambos}    ,
            new CamposSAT(){ CampoSAT="situación del contribuyente"           ,CampoAPP="SituacionContribuyente",TipoPersona=TipoPersona.Ambos}    ,
            new CamposSAT(){ CampoSAT="fecha del último cambio de situación"  ,CampoAPP="FechaUltimoCambioSituacion",TipoPersona=TipoPersona.Ambos},
            new CamposSAT(){ CampoSAT="entidad federativa"                    ,CampoAPP="EntidadFederativa",TipoPersona=TipoPersona.Ambos}         ,
            new CamposSAT(){ CampoSAT="municipio o delegación"                ,CampoAPP="Municipio",TipoPersona=TipoPersona.Ambos}                 ,
            new CamposSAT(){ CampoSAT="colonia"                               ,CampoAPP="Colonia",TipoPersona=TipoPersona.Ambos}                   ,
            new CamposSAT(){ CampoSAT="tipo de vialidad"                      ,CampoAPP="TipoVialidad",TipoPersona=TipoPersona.Ambos}              ,
            new CamposSAT(){ CampoSAT="nombre de la vialidad"                 ,CampoAPP="NombreVialidad",TipoPersona=TipoPersona.Ambos}            ,
            new CamposSAT(){ CampoSAT="número exterior"                       ,CampoAPP="NumeroExterior",TipoPersona=TipoPersona.Ambos}            ,
            new CamposSAT(){ CampoSAT="número interior"                       ,CampoAPP="NumeroInterior",TipoPersona=TipoPersona.Ambos}            ,
            new CamposSAT(){ CampoSAT="cp"                                    ,CampoAPP="CP",TipoPersona=TipoPersona.Ambos}                        ,
            new CamposSAT(){ CampoSAT="correo electrónico"                    ,CampoAPP="Correo",TipoPersona=TipoPersona.Ambos}                    ,
            new CamposSAT(){ CampoSAT="al"                                    ,CampoAPP="AL",TipoPersona=TipoPersona.Ambos}                        ,
            new CamposSAT(){ CampoSAT="régimen"                               ,CampoAPP="Regimen",TipoPersona=TipoPersona.Ambos}                   ,
            new CamposSAT(){ CampoSAT="fecha de alta"                         ,CampoAPP="FechaAlta",TipoPersona=TipoPersona.Ambos}                 ,
        };
        
        protected void Page_Load(object sender, EventArgs e)
        {
            if (HttpContext.Current.Session["usuarioLoggeado"] == null)
                Response.Redirect("Login.aspx");

            var a = new logic_acces(ConexionDB);
            Dictionary<string, string> datos = new Dictionary<string, string>();
            var dt = a.ExecuteQuery("RegimenFiscal_Sel", datos).Tables[0];
            var jSON = this.SerializerJson(this.DataTableToMap(dt));
            this.RunJavascriptBeforeLoadPage("var regimenFiscal = jQuery.parseJSON('" + HttpUtility.JavaScriptStringEncode(jSON) + "');");

            dt = a.ExecuteQuery("UsoCFDIValidos_Cmb", datos).Tables[0];
            jSON = this.SerializerJson(this.DataTableToMap(dt));
            this.RunJavascriptBeforeLoadPage("var usoCfdis = jQuery.parseJSON('" + HttpUtility.JavaScriptStringEncode(jSON) + "');");
        }

        [WebMethod(EnableSession = true)]
        [ScriptMethod]
        static public object Enviar(Dictionary<string, object> datos)
        {
            var lista = new List<Dictionary<string, object>>();
            var result = LeerPaginaSAT(datos);
            lista.Add(result);
            return new { PersonasFisicas= lista.Where(a=> a["TipoPersona"].ToString() =="Física"), PersonasMorales= lista.Where(a => a["TipoPersona"].ToString() == "Moral") }; 
        }

        [WebMethod(EnableSession = true)]
        [ScriptMethod]
        static public void Guardar(Dictionary<string, object> datos)
        {
            var a = new logic_acces(ConexionDB);
            a.ExecuteNonQuery("InformacionFiscal_Ins", datos);
        }

        static public Dictionary<string,object> LeerPaginaSAT(Dictionary<string, object> datos)
        {
            string result = null;
            var rowPersonaFisica = new Dictionary<string, object>();
            var regimenesList = new List<CamposSAT>();
            var dtRfc = new DataTable();
            try
            {

                if (!datos.ContainsKey("usoCfdi"))
                    datos.Add("usoCfdi", "");
                var cfdi = datos["cfdi"].ToString();
                var rfc = datos["rfc"].ToString();
                var usoCfdi = datos["usoCfdi"].ToString();
                rowPersonaFisica["IDCFDI"] = cfdi;
                rowPersonaFisica["RFC"] = rfc;
                rowPersonaFisica["TipoPersona"] = "Física";
                rowPersonaFisica["usoCfdi"] = usoCfdi;
                rowPersonaFisica["ErrorURL"] = false;
                rowPersonaFisica["MensajeError"] = "";


                var a = new logic_acces(ConexionDB);
                
                if (rfc != "")
                {
                    dtRfc = a.ExecuteQuery("RFCValidos_Sel", datos).Tables[0];

                    if (dtRfc.Rows.Count == 0)
                    {
                        rowPersonaFisica["ErrorURL"] = true;
                        result = "No es un RFC válido como cliente";
                        rowPersonaFisica["MensajeError"] = result;
                        return rowPersonaFisica;
                    }

                }
                
                var dt = a.ExecuteQuery("UsoCFDI_Sel", datos).Tables[0];
                if (dt.Rows.Count == 0)
                    rowPersonaFisica["usoCfdi"] = "";
                else
                    rowPersonaFisica["usoCfdi"] = dt.Rows[0]["c_UsoCFDI"].ToString();
                
                var personaFisica = new List<Dictionary<string, string>>();
                var personaMoral = new List<Dictionary<string, string>>();
                HtmlAgilityPack.HtmlWeb website = new HtmlAgilityPack.HtmlWeb();
                HtmlAgilityPack.HtmlDocument document = website.Load(String.Format(ConfigurationManager.AppSettings["URL"], cfdi, rfc)); //https://siat.sat.gob.mx/app/qr/faces/pages/mobile/validadorqr.jsf?D1=10&D2=1&D3=15030128693_AOME8206178N6

                List<HtmlAgilityPack.HtmlNode> dataNodes = document?.DocumentNode?.SelectNodes("//td[@role='gridcell']")?.ToList();

                if (dataNodes != null && dataNodes.Count > 0)
                {
                    dataNodes.RemoveAll(item => (item.OuterHtml.Contains("hide-column-names") || item.OuterHtml.Contains("ubicacionForm"))
                                                || (String.IsNullOrEmpty(item.InnerHtml) && String.IsNullOrEmpty(item.InnerText) && item.PreviousSibling == null));

                    List<string> results = new List<string>();
                    string row = String.Empty;
                    string namedata = null;
                    string valuedata = null;

                    foreach (var node in dataNodes)
                    {
                        if (node.InnerText.Contains(":"))
                        {
                            row = node.InnerText;
                            namedata = row.Replace(":", String.Empty);
                        }
                        else
                        {
                            valuedata = node.InnerText;
                            row += valuedata;
                            results.Add(row);
                        }

                    }

                    foreach (var item in results)
                    {
                        var infoCampo = item.Split(':');
                        var campoSat = camposSat.FirstOrDefault(b => b.CampoSAT.Trim().ToLower() == infoCampo[0].Trim().ToLower());
                        if (campoSat != null)
                        {
                            if (campoSat.TipoPersona == TipoPersona.Fisica)
                            {
                                rowPersonaFisica[campoSat.CampoAPP] = infoCampo[1];
                            }
                            else
                            {
                                if (infoCampo[0].Trim().ToLower() != "régimen" && infoCampo[0].Trim().ToLower() != "fecha de alta")
                                {
                                    rowPersonaFisica[campoSat.CampoAPP] = infoCampo[1];
                                }
                                else
                                {
                                    if (!rowPersonaFisica.ContainsKey(campoSat.CampoAPP))
                                    {
                                        rowPersonaFisica[campoSat.CampoAPP] = infoCampo[1];
                                        
                                        if (campoSat.CampoSAT == "régimen")
                                        {
                                            rowPersonaFisica["Regimenes"] = infoCampo[1];
                                        }
                                        if (campoSat.CampoSAT == "fecha de alta")
                                        {
                                            rowPersonaFisica["FechasDeAlta"] = infoCampo[1];
                                        }

                                    }
                                    else
                                    {

                                        if (campoSat.CampoSAT == "régimen")
                                        {
                                            rowPersonaFisica["Regimenes"] = rowPersonaFisica["Regimenes"] + "|" + infoCampo[1];
                                        }
                                        if (campoSat.CampoSAT == "fecha de alta")
                                        {
                                            rowPersonaFisica["FechasDeAlta"] = rowPersonaFisica["FechasDeAlta"] + "|" + infoCampo[1];
                                        }
                                    }
                                }

                            }
                        }

                    }
                    if (rowPersonaFisica.ContainsKey("CURP") && !String.IsNullOrEmpty(rowPersonaFisica["CURP"].ToString()))
                    {
                        if (rowPersonaFisica.ContainsKey("Nombre"))
                        {
                            rowPersonaFisica["RazonSocial"] = rowPersonaFisica["Nombre"].ToString() + " " + rowPersonaFisica["ApellidoPaterno"].ToString() + " " + rowPersonaFisica["ApellidoMaterno"].ToString();
                        }
                    }
                    
                    var regimenes = rowPersonaFisica["Regimenes"].ToString().Split('|');
                    var fechasAlta = rowPersonaFisica["FechasDeAlta"].ToString().Split('|');
                    var i = 0;
                    foreach (var item in regimenes)
                    {
                        var fecha = fechasAlta[i];
                        var nuevaFecha = 0;
                        if (fecha != "")
                        {
                            var partesFecha = fecha.Split('-');
                            nuevaFecha = Convert.ToInt32(partesFecha[2] + partesFecha[1] + partesFecha[0]);
                        }

                        regimenesList.Add(new CamposSAT() { FechaAlta = nuevaFecha, Regimen = item });
                        i++;
                    }

                    if (regimenesList.Count > 1)
                        rowPersonaFisica["MasUnRegimen"] = 2;
                    else
                        rowPersonaFisica["MasUnRegimen"] = 1;
                    
                    if (regimenesList.Count > 0)
                    {
                        var regimen = regimenesList.OrderByDescending(b => b.FechaAlta).Select(b => b.Regimen).FirstOrDefault();
                        rowPersonaFisica["Regimen"] = regimen;
                        var parameters = new Dictionary<string, string>();
                        parameters.Add("Regimen", regimen);
                        dt = a.ExecuteQuery("RegimenFiscal_Sel", parameters).Tables[0];

                        if (dt.Rows.Count > 0 && rowPersonaFisica["usoCfdi"].ToString() != "" )
                        {
                            parameters = new Dictionary<string, string>();
                            parameters.Add("Regimen", dt.Rows[0]["Id"].ToString());
                            parameters.Add("UsoCFDI", rowPersonaFisica["usoCfdi"].ToString());
                            dt = a.ExecuteQuery("UsoCFDIValidos_Sel", parameters).Tables[0];
                            if (dt.Rows.Count == 0)
                            {
                                if (!datos.ContainsKey("esMasivo"))
                                {
                                    rowPersonaFisica["ErrorURL"] = true;
                                    result = "El uso del CFDI no es valido para el régimen Fiscal que tiene asignado el cliente";
                                    rowPersonaFisica["MensajeError"] = result;
                                    return rowPersonaFisica;
                                }
                                else
                                {
                                    rowPersonaFisica["usoCfdi"] = "";
                                }
                            }
                        }
                    }
                
                    result = String.Join("<br>", results.ToArray());
                    if (String.IsNullOrEmpty(result))
                    {
                        rowPersonaFisica["ErrorURL"] = true;
                        result = "No encontró información Cédula Fiscal";
                        rowPersonaFisica["MensajeError"] = result;
                        return rowPersonaFisica;
                    }
                    dtRfc = a.ExecuteQuery("InformacionFiscal_Sel", datos).Tables[0];

                    if (dtRfc.Rows.Count > 0 )
                    {
                        if (!datos.ContainsKey("esMasivo"))
                            result = "ACTUALIZAR";
                        else
                            result = "El RFC ya existe (" +rfc +")" ;

                        rowPersonaFisica["ErrorURL"] = true;
                        //result = "ACTUALIZAR";
                        rowPersonaFisica["MensajeError"] = result;
                        return rowPersonaFisica;
                    }
                }
                else
                {
                    rowPersonaFisica["ErrorURL"] = true;
                    result = "No encontró información de Cédula Fiscal (RFC: " + rfc + ")";
                    rowPersonaFisica["MensajeError"] = result;
                    return rowPersonaFisica;
                }
            }
            catch (Exception ex)
            {
                rowPersonaFisica["ErrorURL"] = true;
                result = $"Ha ocurrido un error: {ex}";
                rowPersonaFisica["MensajeError"] = result;
                return rowPersonaFisica;
            }

            return rowPersonaFisica;
        }

        [WebMethod(EnableSession = true)]
        [ScriptMethod]
        static public List<Dictionary<string, object>> ValidaCliente(Dictionary<string, object> datos)
        {
            var a = new logic_acces(ConexionDB);
            var dt = a.ExecuteQuery("ClienteRFC_Sel", datos).Tables[0];
            var cliente = Base.DataTableToMap(dt);
            return cliente;
        }

        protected void lnkDescargaLog_Click(object sender, EventArgs e)
        {
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            List<Dictionary<string, object>> errores = serializer.Deserialize<List<Dictionary<string, object>>>(hdnErrores.Value);
            var pck = new ExcelPackage(new FileInfo(HttpContext.Current.Server.MapPath("~/Templates/LogErrores.xlsx")), true);

            var ws = pck.Workbook.Worksheets[1];
            var renglon = 2;

            foreach (var item in errores)
            {

                ws.Cells[renglon, 1].Value = item["RFC"].ToString();
                ws.Cells[renglon, 2].Value = item["IDCFDI"].ToString();
                ws.Cells[renglon, 3].Value = item["usoCfdi"].ToString();
                ws.Cells[renglon, 4].Value = item["MensajeError"].ToString().Replace("|", " | ");
                renglon++;
            }

            Byte[] bytes = pck.GetAsByteArray();
            HttpContext.Current.Response.AddHeader("Content-disposition", "attachment; filename=LogErrores.xlsx");
            HttpContext.Current.Response.ContentType = ".xlsx";
            HttpContext.Current.Response.BinaryWrite(bytes);
            HttpContext.Current.Response.End();

        }

        [WebMethod(EnableSession = true)]
        [ScriptMethod]
        static public void CerrarSesion(Dictionary<string, object> datos)
        {
            HttpContext.Current.Session["usuarioLoggeado"] = null;
        }
    }
}