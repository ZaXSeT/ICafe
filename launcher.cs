using System;
using System.Diagnostics;

class Program
{
    static void Main()
    {
        ProcessStartInfo psi = new ProcessStartInfo();
        
        try {
            psi.FileName = "msedge";
            psi.Arguments = "--app=https://icafe-xi.vercel.app/app --window-size=420,800 --window-position=500,50";
            Process.Start(psi);
        } catch {
            try {
                psi.FileName = "chrome";
                Process.Start(psi);
            } catch {
                psi.FileName = "http://localhost:3000/app";
                psi.UseShellExecute = true;
                Process.Start(psi);
            }
        }
    }
}
