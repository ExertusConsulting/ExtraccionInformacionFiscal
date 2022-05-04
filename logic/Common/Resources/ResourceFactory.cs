using System;
using System.Collections;
using System.Globalization;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

namespace logic.Common.Resources
{
    public class ResourceFactory
    {
        private ResourceFactory()
        { 
        }

        private static Hashtable tablaResources = new Hashtable();

        //public static KeyValuePlainTextResource CreateResource(string resourceName, CultureInfo culture, bool isReinitilize)
        //{
        //    string resourceKey = resourceName + "." + culture.TwoLetterISOLanguageName;

        //    if (tablaResources.ContainsKey(resourceKey) && !isReinitilize)
        //    {
        //        return (KeyValuePlainTextResource)tablaResources[resourceKey];
        //    }
        //    else
        //    {
        //        ArrayList listarecursos = new ArrayList();

        //        string resourcefile = resourceKey;
                 
        //        string route = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, KeyValuePlainTextResource.PathHelper(@"Resources\" + resourceKey + ".res.txt"));
        //        route = Path.GetFullPath(route);

        //        if (!File.Exists(route))
        //        {
        //            resourcefile = resourceName;
        //        }

        //        KeyValuePlainTextResource keyValuePlainTextResource = new KeyValuePlainTextResource(@"Resources\" + resourcefile + ".res.txt");
        //        tablaResources[resourceKey] = keyValuePlainTextResource;
        //        return keyValuePlainTextResource;
        //    }
        //}

        //public static KeyValuePlainTextResource CreateResource(string resourceName, bool isReinitialize)
        //{
        //    return CreateResource(resourceName, CultureInfo.CurrentCulture, isReinitialize);
        //}

        //public static KeyValuePlainTextResource CreateResource(string resourceName, bool isReinitialize, CultureInfo cultureInfo)
        //{
        //    return CreateResource(resourceName, cultureInfo, isReinitialize);
        //}

        public static KeyValuePlainTextResource CreateResource(string resourceName, CultureInfo culture, bool isReinitilize, string LenguajeCode)
        {
            string resourceKey = resourceName + "." + LenguajeCode;

            if (tablaResources.ContainsKey(resourceKey) && !isReinitilize)
            {
                return (KeyValuePlainTextResource)tablaResources[resourceKey];
            }
            else
            {
                ArrayList listarecursos = new ArrayList();

                string resourcefile = resourceKey;

                string route = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, KeyValuePlainTextResource.PathHelper(@"Resources\" + resourceKey + ".res.txt"));
                route = Path.GetFullPath(route);

                if (!File.Exists(route))
                {
                    resourcefile = resourceName;
                }

                KeyValuePlainTextResource keyValuePlainTextResource = new KeyValuePlainTextResource(@"Resources\" + resourcefile + ".res.txt", LenguajeCode);
                tablaResources[resourceKey] = keyValuePlainTextResource;
                return keyValuePlainTextResource;
            }
        }

        public static KeyValuePlainTextResource CreateResource(string resourceName, bool isReinitialize, String LenguajeCode)
        {
            return CreateResource(resourceName, CultureInfo.CurrentCulture, isReinitialize, LenguajeCode);
        }
    }
}