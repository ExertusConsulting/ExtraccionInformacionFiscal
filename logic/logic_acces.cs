using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Odbc;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;
using System.Collections;
using Odbc = System.Data.Odbc; 

namespace logic
{
    public class logic_acces
    {
        private static logic.BasePage Base = new BasePage();
        SqlConnection sqlConection;
        static string conexionString; 

        public logic_acces(String strConn, bool esValidarSesion)
        {
            if (esValidarSesion)
            {
                //if (HttpContext.Current.Session["UserId"] == null)
                //{
                //    string msgError = Base.CommonResourceManager.GetMessage("msgSinSesion") == null ? " -999.- La sesión ha caducado se requiere volver a iniciar sesión." : Base.CommonResourceManager.GetMessage("msgSinSesion");
                //    throw new Exception(msgError);
                //}
            }

            this.sqlConection = new SqlConnection(strConn);
            conexionString = strConn;
        }

        public logic_acces(String strConn)
        {
            //if (HttpContext.Current.Session["UserId"] == null)
            //{
            //    string msgError = Base.CommonResourceManager.GetMessage("msgSinSesion") == null ? " -999.- La sesión ha caducado se requiere volver a iniciar sesión." : Base.CommonResourceManager.GetMessage("msgSinSesion");
            //    throw new Exception(msgError);
            //}

            this.sqlConection = new SqlConnection(strConn);
            conexionString = strConn;
        }

        public logic_acces(String strConn, String str)
        {
            //if (HttpContext.Current.Session["UserId"] == null)
            //{
            //    throw new Exception("-999.- La sesión ha caducado se requiere volver a iniciar sesión.");
            //}

            this.sqlConection = new SqlConnection(strConn);
            conexionString = strConn;
        }
        
        public DataSet ExecuteQuery(string p_procedure, Dictionary<string, string> p_datos)
        {
            DataSet ds = new DataSet();
            BasePage basePage = new BasePage();
            using (SqlConnection conn = new SqlConnection(conexionString))
            {
                string sNomParametro = string.Empty;
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(p_procedure, conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                   SqlCommandBuilder.DeriveParameters(cmd);
                    foreach (SqlParameter param in cmd.Parameters)
                    {
                        if (param.Direction == ParameterDirection.Input || param.Direction == ParameterDirection.InputOutput)
                        {
                            sNomParametro = param.ParameterName.Substring(3, param.ParameterName.Length - 3);

                            foreach (KeyValuePair<string, string> entry in p_datos)
                            {
                                if (entry.Key.ToString().ToLower() == sNomParametro.ToLower())
                                {
                                    param.Value = entry.Value;
                                    break;
                                }
                            }

                            //Si el parametro es de tipo numero y se recibio un '' desde codigo se envia null a la base de datos.
                            if ((BasePage.ToString(param.Value) == "") && (param.SqlDbType == SqlDbType.Int || param.SqlDbType == SqlDbType.Float || param.SqlDbType == SqlDbType.Decimal))
                            {
                                param.Value = null;
                            }

                            //Si no encontro ningun valor verificamos si es de los parametros defaults.
                            if (param.Value == null)
                            {
                                if (sNomParametro.ToLower() == "namepcmod")
                                {
                                    param.Value = basePage.NombrePcMod;
                                }

                                if (sNomParametro.ToLower() == "idioma")
                                {
                                    param.Value = HttpContext.Current.Session["LenguajeCode"] == null ? "es" : HttpContext.Current.Session["LenguajeCode"];
                                    //param.Value = Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName;
                                }

                                if (sNomParametro.ToLower() == "audituserid")
                                {
                                    param.Value = HttpContext.Current.Session["UserId"] == null ? 0 : HttpContext.Current.Session["UserId"];
                                }
                            }
                        }
                    }

                    SqlDataAdapter adp = new SqlDataAdapter(cmd);
                    adp.Fill(ds);


                    return ds;
                }
            }
        }

        public DataSet ExecuteQuery(string p_procedure, Dictionary<string, object> p_datos)
        {
            DataSet ds = new DataSet();
            BasePage basePage = new BasePage();
            using (SqlConnection conn = new SqlConnection(conexionString))
            {
                string sNomParametro = string.Empty;
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(p_procedure, conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    SqlCommandBuilder.DeriveParameters(cmd);
                    foreach (SqlParameter param in cmd.Parameters)
                    {
                        if (param.Direction == ParameterDirection.Input || param.Direction == ParameterDirection.InputOutput)
                        {
                            sNomParametro = param.ParameterName.Substring(3, param.ParameterName.Length - 3);

                            foreach (KeyValuePair<string, object> entry in p_datos)
                            {
                                if (entry.Key.ToString().ToLower() == sNomParametro.ToLower())
                                {
                                    param.Value = entry.Value;
                                    break;
                                }
                            }

                            //Si el parametro es de tipo numero y se recibio un '' desde codigo se envia null a la base de datos.
                            if ((BasePage.ToString(param.Value) == "") && (param.SqlDbType == SqlDbType.Int || param.SqlDbType == SqlDbType.Float || param.SqlDbType == SqlDbType.Decimal))
                            {
                                param.Value = null;
                            }

                            //Si no encontro ningun valor verificamos si es de los parametros defaults.
                            if (param.Value == null)
                            {
                                if (sNomParametro.ToLower() == "namepcmod")
                                {
                                    param.Value = basePage.NombrePcMod;
                                }

                                if (sNomParametro.ToLower() == "idioma")
                                {
                                    param.Value = HttpContext.Current.Session["LenguajeCode"] == null ? "es" : HttpContext.Current.Session["LenguajeCode"];
                                    //param.Value = Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName;
                                }

                                if (sNomParametro.ToLower() == "audituserid")
                                {
                                    param.Value = HttpContext.Current.Session["UserId"] == null ? 0 : HttpContext.Current.Session["UserId"];
                                }
                            }
                        }
                    }

                    SqlDataAdapter adp = new SqlDataAdapter(cmd);
                    adp.Fill(ds);


                    return ds;
                }
            }
        }

        public void ExecuteNonQuery(string nombreSP, Dictionary<string, string> parameters)
        {
            BasePage basePage = new BasePage();

            using (SqlConnection conn = new SqlConnection(conexionString))
            {
                string sNomParametro = string.Empty;
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(nombreSP, conn))
                { 
                    cmd.CommandType = CommandType.StoredProcedure;
                    SqlCommandBuilder.DeriveParameters(cmd);
                    foreach (SqlParameter param in cmd.Parameters)
                    {
                        if (param.Direction == ParameterDirection.Input || param.Direction == ParameterDirection.InputOutput)
                        {
                            sNomParametro = param.ParameterName.Substring(3, param.ParameterName.Length - 3);

                            foreach (KeyValuePair<string, string> entry in parameters)
                            {
                                if (entry.Key.ToString().ToLower() == sNomParametro.ToLower())
                                {
                                    param.Value = entry.Value;
                                    break;
                                }
                            }

                            //Si el parametro es de tipo numero y se recibio un '' desde codigo se envia null a la base de datos.
                            if ((BasePage.ToString( param.Value) == "") && (param.SqlDbType == SqlDbType.Int || param.SqlDbType == SqlDbType.Float || param.SqlDbType == SqlDbType.Decimal))
                            {
                                param.Value = null;
                            }

                            //Si no encontro ningun valor verificamos si es de los parametros defaults.
                            if (param.Value == null)
                            {
                                if (sNomParametro.ToLower() == "namepcmod")
                                {
                                    param.Value = basePage.NombrePcMod;
                                }

                                if (sNomParametro.ToLower() == "idioma")
                                {
                                    param.Value = HttpContext.Current.Session["LenguajeCode"] == null ? "es" : HttpContext.Current.Session["LenguajeCode"];
                                }

                                if (sNomParametro.ToLower() == "audituserid")
                                {
                                    param.Value = HttpContext.Current.Session["UserId"] == null ? 0 : HttpContext.Current.Session["UserId"];
                                }
                            }

                            //if (parameters[sNomParametro] != null)
                            //{
                            //    param.Value = parameters[sNomParametro];
                            //}
                            //else
                            //{
                            //    param.Value = System.DBNull.Value;
                            //}
                        }
                    }

                   cmd.ExecuteNonQuery();

                    var key = string.Empty;

                    foreach (SqlParameter param in cmd.Parameters)
                    {
                        if (param.Direction == ParameterDirection.Output || param.Direction == ParameterDirection.InputOutput)
                        {
                            sNomParametro = param.ParameterName.Substring(3, param.ParameterName.Length - 3);

                            foreach (KeyValuePair<string, string> entry in parameters)
                            {
                                if (entry.Key.ToString().ToLower() == sNomParametro.ToLower())
                                {
                                    key = entry.Key.ToString();
                                    break;
                                }
                            }

                            parameters[key] = param.Value.ToString();
                            //if (parameters[sNomParametro] != null){
                            //    parameters[sNomParametro] = param.Value;
                            //} 
                        }
                    }
                }
            }
        }

        public void ExecuteNonQuery(string nombreSP, Dictionary<string, object> parameters)
        {
            BasePage basePage = new BasePage();

            using (SqlConnection conn = new SqlConnection(conexionString))
            {
                string sNomParametro = string.Empty;
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(nombreSP, conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    SqlCommandBuilder.DeriveParameters(cmd);
                    foreach (SqlParameter param in cmd.Parameters)
                    {
                        if (param.Direction == ParameterDirection.Input || param.Direction == ParameterDirection.InputOutput)
                        {
                            sNomParametro = param.ParameterName.Substring(3, param.ParameterName.Length - 3);

                            foreach (KeyValuePair<string, object> entry in parameters)
                            {
                                if (entry.Key.ToString().ToLower() == sNomParametro.ToLower())
                                {
                                    param.Value = entry.Value;
                                    break;
                                }
                            }

                            //Si el parametro es de tipo numero y se recibio un '' desde codigo se envia null a la base de datos.
                            if ((BasePage.ToString(param.Value) == "") && (param.SqlDbType == SqlDbType.Int || param.SqlDbType == SqlDbType.Float || param.SqlDbType == SqlDbType.Decimal))
                            {
                                param.Value = null;
                            }

                            //Si no encontro ningun valor verificamos si es de los parametros defaults.
                            if (param.Value == null)
                            {
                                if (sNomParametro.ToLower() == "namepcmod")
                                {
                                    param.Value = basePage.NombrePcMod;
                                }

                                if (sNomParametro.ToLower() == "idioma")
                                {
                                    param.Value = HttpContext.Current.Session["LenguajeCode"] == null ? "es" : HttpContext.Current.Session["LenguajeCode"];
                                }

                                if (sNomParametro.ToLower() == "audituserid")
                                {
                                    param.Value = HttpContext.Current.Session["UserId"] == null ? 0 : HttpContext.Current.Session["UserId"];
                                }
                            }

                            //if (parameters[sNomParametro] != null)
                            //{
                            //    param.Value = parameters[sNomParametro];
                            //}
                            //else
                            //{
                            //    param.Value = System.DBNull.Value;
                            //}
                        }
                    }

                    cmd.ExecuteNonQuery();

                    var key = string.Empty;

                    foreach (SqlParameter param in cmd.Parameters)
                    {
                        if (param.Direction == ParameterDirection.Output || param.Direction == ParameterDirection.InputOutput)
                        {
                            sNomParametro = param.ParameterName.Substring(3, param.ParameterName.Length - 3);

                            foreach (KeyValuePair<string, object> entry in parameters)
                            {
                                if (entry.Key.ToString().ToLower() == sNomParametro.ToLower())
                                {
                                    key = entry.Key.ToString();
                                    break;
                                }
                            }

                            parameters[key] = param.Value.ToString();
                            //if (parameters[sNomParametro] != null){
                            //    parameters[sNomParametro] = param.Value;
                            //} 
                        }
                    }
                }
            }
        }

        public void ExecuteNonQuery(string nombreSP, Dictionary<string, object> parameters, int subtringLength)
        {
            BasePage basePage = new BasePage();

            using (SqlConnection conn = new SqlConnection(conexionString))
            {
                string sNomParametro = string.Empty;
                conn.Open();
                using (SqlCommand cmd = new SqlCommand(nombreSP, conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    SqlCommandBuilder.DeriveParameters(cmd);
                    foreach (SqlParameter param in cmd.Parameters)
                    {
                        if (param.Direction == ParameterDirection.Input || param.Direction == ParameterDirection.InputOutput)
                        {
                            sNomParametro = param.ParameterName.Substring(subtringLength, param.ParameterName.Length - subtringLength);

                            foreach (KeyValuePair<string, object> entry in parameters)
                            {
                                if (entry.Key.ToString().ToLower() == sNomParametro.ToLower())
                                {
                                    param.Value = entry.Value;
                                    break;
                                }
                            }

                            //Si el parametro es de tipo numero y se recibio un '' desde codigo se envia null a la base de datos.
                            if ((BasePage.ToString(param.Value) == "") && (param.SqlDbType == SqlDbType.Int || param.SqlDbType == SqlDbType.Float || param.SqlDbType == SqlDbType.Decimal))
                            {
                                param.Value = DBNull.Value;
                            }

                            //Si no encontro ningun valor verificamos si es de los parametros defaults.
                            if (param.Value == null)
                            {
                                if (sNomParametro.ToLower() == "namepcmod")
                                {
                                    param.Value = basePage.NombrePcMod;
                                }

                                if (sNomParametro.ToLower() == "idioma")
                                {
                                    param.Value = HttpContext.Current.Session["LenguajeCode"] == null ? "es" : HttpContext.Current.Session["LenguajeCode"];
                                }

                                if (sNomParametro.ToLower() == "audituserid")
                                {
                                    param.Value = HttpContext.Current.Session["UserId"] == null ? 0 : HttpContext.Current.Session["UserId"];
                                }
                            }

                            //if (parameters[sNomParametro] != null)
                            //{
                            //    param.Value = parameters[sNomParametro];
                            //}
                            //else
                            //{
                            //    param.Value = System.DBNull.Value;
                            //}
                        }
                    }

                    cmd.ExecuteNonQuery();

                    var key = string.Empty;

                    foreach (SqlParameter param in cmd.Parameters)
                    {
                        if (param.Direction == ParameterDirection.Output || param.Direction == ParameterDirection.InputOutput)
                        {
                            sNomParametro = param.ParameterName.Substring(subtringLength, param.ParameterName.Length - subtringLength);

                            foreach (KeyValuePair<string, object> entry in parameters)
                            {
                                if (entry.Key.ToString().ToLower() == sNomParametro.ToLower())
                                {
                                    key = entry.Key.ToString();
                                    break;
                                }
                            }

                            parameters[key] = param.Value.ToString();
                            //if (parameters[sNomParametro] != null){
                            //    parameters[sNomParametro] = param.Value;
                            //} 
                        }
                    }
                }
            }
        }

        public void ExecuteComandTextQuery(string comando)
        {
            BasePage basePage = new BasePage();

            using (SqlConnection conn = new SqlConnection(conexionString))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand())
                {
                    cmd.Connection = conn;
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandText = comando;
                    cmd.ExecuteNonQuery();
                }
            }
        }

        public DataSet ExecuteComandTextNonQuery(string comando)
        {
            DataSet ds = new DataSet();
            BasePage basePage = new BasePage();
            using (SqlConnection conn = new SqlConnection(conexionString))
            { 
                conn.Open();
                using (SqlCommand cmd = new SqlCommand())
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandText = comando;
                    cmd.Connection = conn;

                    SqlDataAdapter adp = new SqlDataAdapter(cmd);
                    adp.Fill(ds);


                    return ds;
                }
            }
        }

    }
}
