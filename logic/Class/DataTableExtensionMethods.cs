using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace logic.Class
{
    public static class DataTableExtensionMethods
    {
        public static string ToXml(this DataTable dt)
        {
            string xml;
            using (StringWriter sw = new StringWriter())
            {
                dt.WriteXml(sw);
                xml = sw.ToString();
            }
            return xml;
        }
    }
}
