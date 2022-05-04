using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace logic.Class
{
    public class UserInfo
    {
        public int UserId { get; set; }
        public string NombreCompleto { get; set; }
        public string Correo { get; set; }
        public string RutaFoto { get; set; }

        public UserInfo(int userID, string nombreCompleto, string correo, string rutaFoto)
        {
            this.UserId = userID;
            this.NombreCompleto = nombreCompleto;
            this.Correo = correo;
            this.RutaFoto = rutaFoto;
        }
    }
}
