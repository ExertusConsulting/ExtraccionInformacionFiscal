using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.SessionState; 

namespace logic.Common.Resources
{
    public class CultureManager
    {
        private const string SESSION_CULTURE = "SESSION_CULTURE";
        public const string CULTURE_PARAM = "ealang"; 

        public static void Initialize()
        {
            CultureInfo current = ResolveCulture();
            StoreCulture(current);
        }

        public static void StoreCulture(string culture)
        {
            if (!CultureExists(culture))
                throw new ArgumentException("Invalid data, unrecognized culture identifier " + culture);

            StoreCulture(CultureInfo.CreateSpecificCulture(culture));
        }

        public static void StoreCulture(CultureInfo culture)
        {
            Thread.CurrentThread.CurrentUICulture = culture;
            Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(culture.Name);

            HttpSessionState session = HttpContext.Current.Session;
            if (session != null)
            {
                session[SESSION_CULTURE] = culture;
                 
                session["Idioma"] = culture.TwoLetterISOLanguageName;
            }
        }

        /*
        public static CultureInfo ResolveCulture()
        {
            if (HttpContext.Current != null)
            {
                HttpRequest request = HttpContext.Current.Request;
                string language = request.QueryString[CULTURE_PARAM];
                 
                if (CultureExists(language))
                {
                    StoreCulture(language);
                    var nameValues = HttpUtility.ParseQueryString(HttpContext.Current.Request.QueryString.ToString());
                    nameValues.Remove(CULTURE_PARAM); 
                    string url = HttpContext.Current.Request.Url.AbsolutePath;
                    string updatedQueryString = "?" + nameValues.ToString();
                    // Redirect explicito para removerlo del query string
                    HttpContext.Current.Response.Redirect(url + updatedQueryString);
                }
                // Seccion para el manejo del lenguaje en sesion
                HttpSessionState session = HttpContext.Current.Session;
                if (session != null && session[SESSION_CULTURE] != null)
                {
                    return session[SESSION_CULTURE] as CultureInfo;
                }
            }
            // Seccion para el manejo del lenguaje default
            var culture = new CultureInfo(Thread.CurrentThread.CurrentCulture.Name);
            string cultureName = DefaultCulture();

            if (Thread.CurrentThread.CurrentCulture.Name != cultureName)
                culture = new CultureInfo(cultureName);

            return culture;
        }
         * */

        public static CultureInfo ResolveCulture()
        {

            string[] languages = HttpContext.Current.Request.UserLanguages;

            if (languages == null || languages.Length == 0)
            {
                if (HttpContext.Current.Session["DefaultLanguageID"] != null)
                {
                    if (HttpContext.Current.Session["DefaultLanguageID"].ToString().Length > 0)
                    {
                        return CultureInfo.CreateSpecificCulture(HttpContext.Current.Session["DefaultLanguageID"].ToString());
                    }
                }

                return new CultureInfo(DefaultCulture());
            }

            try
            {
                if (HttpContext.Current.Session["DefaultLanguageID"] != null)
                {
                    if (HttpContext.Current.Session["DefaultLanguageID"].ToString().Length > 0)
                    {
                        return CultureInfo.CreateSpecificCulture(HttpContext.Current.Session["DefaultLanguageID"].ToString());
                    }
                }
               
                string language = languages[0].ToLowerInvariant().Trim();
                return CultureInfo.CreateSpecificCulture(language);
                
            }

            catch (ArgumentException)
            {

                return new CultureInfo(DefaultCulture());

            }

        }



        private static string DefaultCulture()
        {
            string cultureName = "es-MX";

            if (ConfigurationManager.AppSettings["CultureDefault"] == null)
                return cultureName;

            cultureName = ConfigurationManager.AppSettings["CultureDefault"];
            return cultureName;
        }

        public static bool CultureExists(string name)
        {
            if (!string.IsNullOrEmpty(name))
            {
                CultureInfo[] userCultures = CultureInfo.GetCultures(CultureTypes.AllCultures);
                return userCultures.FirstOrDefault(x => x.Name.Equals(name, StringComparison.OrdinalIgnoreCase)) != null;
            }
            return false;
        }

        public static CultureInfo CreateSpecificCulture(string language)
        { 
            try
            { 
                return CultureInfo.CreateSpecificCulture(language);
            }

            catch (ArgumentException)
            { 
                return new CultureInfo(DefaultCulture()); 
            }

        }
    }
}