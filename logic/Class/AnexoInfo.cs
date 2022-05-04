using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace logic.Class
{
    public class AnexoInfo
    {
        public string _fileName;
        public string _contentType;
        public byte[] _source;
        public int _fileId;
        public string Extension { get; set; }

        public AnexoInfo()
        {
        }

        public AnexoInfo(string pmtFileName, string pmtContentType, byte[] pmtSource, string _Ext)
        {
            _fileName = pmtFileName;
            _contentType = pmtContentType;
            _source = pmtSource;

            this.Extension = _Ext;
        }

        public AnexoInfo(string pmtFileName, string pmtContentType, byte[] pmtSource, string _Ext, int fileID)
        {
            _fileName = pmtFileName;
            _contentType = pmtContentType;
            _source = pmtSource;
            _fileId = fileID;
            this.Extension = _Ext;
        }
    }
}
