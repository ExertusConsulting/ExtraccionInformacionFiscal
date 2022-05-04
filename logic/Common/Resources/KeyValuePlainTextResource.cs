using System;
using System.Collections;
using System.Data;
using System.Globalization;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace logic.Common.Resources
{
    public class KeyValuePlainTextResource
    {
        private IList loadedResources = new ArrayList();

        readonly Hashtable tablaResources = new Hashtable();

        private string resourceFile;

        public KeyValuePlainTextResource(string resourceFile, string LenguajeCode)
        {
            this.resourceFile = resourceFile;
            LoadResource(LenguajeCode);
        }

        public string ResourceFile
        {
            set { resourceFile = value; }
        }

        public string DefaultLanguage
        {
            get { return CultureInfo.CurrentCulture.TwoLetterISOLanguageName; }
        }

        public string GetMessage(string key)
        {
            return GetMessage(key, null, null);
        }

        public string GetMessage(string key, CultureInfo cultureInfo)
        {
            return GetMessage(key, cultureInfo, null);
        }

        public string GetMessage(string key, string[] substitutions)
        {
            return GetMessage(key, null, substitutions);
        }

        public string GetMessage(string key, CultureInfo cultureInfo, string[] substitutions)
        {

            string twoLetterISOLanguageName = cultureInfo != null ? cultureInfo.TwoLetterISOLanguageName : DefaultLanguage;


            if (!loadedResources.Contains(twoLetterISOLanguageName)) LoadResource(twoLetterISOLanguageName);

            string message = null;
            Hashtable tablaResourceIdiomaSolicitado = null;


            if (tablaResources[twoLetterISOLanguageName] == null) return null;
            tablaResourceIdiomaSolicitado = (Hashtable)tablaResources[twoLetterISOLanguageName];


            if (!tablaResourceIdiomaSolicitado.ContainsKey(key)) return null;
            message = (string)tablaResourceIdiomaSolicitado[key];


            if (substitutions == null || substitutions.Length == 0) return message;
            return String.Format(message, substitutions);
        }

        public DataTable GetResourcesValues(string LenguajeCode)
        {
            var dataTable = new DataTable();
            dataTable.Columns.Add("Key", typeof(string));
            dataTable.Columns.Add("Value", typeof(string));
             
            string culture = string.Empty;
            string resFile = GetFileName();

            if (string.IsNullOrEmpty(resFile))
                return dataTable;

            string culturecode = string.IsNullOrEmpty(culture) ? BuildCultureCodeString(resFile) : culture;

            Hashtable cultureResources;
            if (tablaResources.ContainsKey(culturecode))
            {
                cultureResources = (Hashtable)tablaResources[culturecode];
            }
            else
            {
                cultureResources = new Hashtable();
                tablaResources.Add(culturecode, cultureResources);
            }

            foreach (DictionaryEntry entry in cultureResources)
            {
                var row = dataTable.NewRow();

                row["Key"] = entry.Key.ToString();
                row["Value"] = entry.Value.ToString();

                dataTable.Rows.Add(row);
            }

            return dataTable;
        }

        private void LoadResource(string culture)
        {
            string line = null;


            string resFile = GetFileName();

            if (string.IsNullOrEmpty(resFile))
                return;


            string culturecode = string.IsNullOrEmpty(culture) ? BuildCultureCodeString(resFile) : culture;

            Hashtable cultureResources;
            if (tablaResources.ContainsKey(culturecode))
            {
                cultureResources = (Hashtable)tablaResources[culturecode];
            }
            else
            {
                cultureResources = new Hashtable();
                tablaResources.Add(culturecode, cultureResources);
            }

            using (StreamReader sr = new StreamReader(resFile, Encoding.Default))
            {
                while ((line = sr.ReadLine()) != null)
                {
                    if (string.IsNullOrWhiteSpace(line))
                        continue;

                    string[] tokens = line.Split('=');
                    string llave = tokens[0].Trim();
                    string valor = tokens[1].Trim();
                    cultureResources.Add(llave, valor);
                }
            }
            loadedResources.Add(culture);
        }

        private string BuildCultureCodeString(string filename)
        {

            string culturecode = filename.ToLower();


            culturecode = Regex.Replace(culturecode, @"(.*)[/]", "");
            culturecode = Regex.Replace(culturecode, @"(.*)[\\]", "");


            culturecode = Regex.Replace(culturecode, @".res.txt$", "");


            culturecode = Regex.Replace(culturecode, @"(.*)[(.)]", "");

            if (culturecode.Length != 2)
            {
                culturecode = DefaultLanguage;
            }
            return culturecode;
        }

        private string GetFileName()
        {
            string resultado = null;

            string route = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, PathHelper(resourceFile));
            route = Path.GetFullPath(route);

            if (File.Exists(route))
            {
                resultado = route;
            }

            return resultado;
        }

        internal static string PathHelper(string pathDirectory)
        {
            pathDirectory = pathDirectory.Replace(@"/\", "/");
            pathDirectory = pathDirectory.Replace(@"\/", @"\");
            pathDirectory = pathDirectory.Replace("//", "/");
            pathDirectory = pathDirectory.Replace(@"\\", @"\");
            pathDirectory = pathDirectory.Replace(@"/\/", "/");
            pathDirectory = pathDirectory.Replace(@"\/\", @"\");
            return pathDirectory;
        }
    }
}