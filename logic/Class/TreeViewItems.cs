using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace logic.Class
{
    public class TreeViewItems
    {
        public TreeViewItems()
        {
            ChildItems = new List<TreeViewItems>();
        }


        public String Id { get; set; }
        public String Text { get; set; }
        public String Url { get; set; }
        public List<TreeViewItems> ChildItems { get; set; }
    }
} 