using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace logic.Class
{
    [Serializable, XmlRoot("menu")]
    public class Menu 
    {
        public Menu()
        {
            this.items = new List<MenuItem>() { };
        }

        [XmlElement(typeof(MenuItem), ElementName = "menuItem")]
        public List<MenuItem> items { get; set; }
    }

   [Serializable, XmlRoot("menuItem")]
    public class MenuItem
    {
        public MenuItem()
        {
            this.items = new List<MenuItem>() { };
        }
        [XmlElement("Titulo")]
        public string Titulo { get; set; }
        [XmlElement("url")]
        public string url { get; set; }
        [XmlElement("ModuloID")]
        public int ModuloID { get; set; }

        [XmlElement("EsMostrarEnMenu")]
        public int EsMostrarEnMenu { get; set; }
       

        [XmlElement(typeof(MenuItem), ElementName = "menuItem")] 
        public List<MenuItem> items { get; set; }
    }
}
