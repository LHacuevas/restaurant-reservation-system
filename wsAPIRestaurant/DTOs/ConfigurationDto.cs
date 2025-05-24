public class DefaultConfigurationDto
    {
        public int Id { get; set; }
        public int FourSeaterTables { get; set; }
        public int SixSeaterTables { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class DefaultConfigurationCreateUpdateDto
    {
        public int FourSeaterTables { get; set; }
        public int SixSeaterTables { get; set; }
    }

    public class DailyServiceSettingDto
    {
        public string Date { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int FourSeaterTables { get; set; }
        public int SixSeaterTables { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class DailyServiceSettingCreateUpdateDto
    {
        public string Date { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int FourSeaterTables { get; set; }
        public int SixSeaterTables { get; set; }
    }