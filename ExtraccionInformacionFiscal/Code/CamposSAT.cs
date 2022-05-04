using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ExtraccionInformacionFiscal.Code
{
    public class CamposSAT
    {
        public string CampoSAT { get; set; }
        public string CampoAPP { get; set; }
        public TipoPersona TipoPersona { get; set; }
        public int FechaAlta { get; set; }
        public string Regimen { get; set; }
    }

    public enum TipoPersona
    { 
        Fisica=1,
        Moral=2,
        Ambos=3

    }
}