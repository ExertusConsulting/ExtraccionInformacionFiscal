using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace logic
{
    public class BaseMaster : System.Web.UI.MasterPage
    {
        public BasePage basePage = new BasePage();
        public virtual string ServicioID
        {
            get { return basePage.GetAppSetting("ServicioID"); } 
        }
    }
}
