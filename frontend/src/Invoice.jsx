import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Plus, Trash2, Edit3, Eye, Printer, FileText } from 'lucide-react';

const Invoice = () => {
  const invoiceRef = useRef();
  
  const [formData, setFormData] = useState({
    invoiceNo: '01234',
    date: '11.02.2030',
    dueDate: '11.03.2030',
    issuedTo: {
      companyName: 'InterviewBit Software Services Pvt.',
      addressLine1: 'Surya Park II, 5th Floor, Survey',
      addressLine2: 'Nos. Sy No 91/1, 91/2, 91/3,',
      addressLine3: 'Veerasandra Village, Hosur Road,',
      addressLine4: 'Bangalore South, Electronic City',
      location: 'Electronics City, Bangalore, Karnataka, India - 560100',
      pan: 'AAGCI1582C',
      gst: '29AAGCI1582C1ZN'
    },
    payTo: {
      accHolder: 'vamsi krishna',
      accNo: '1234567654',
      ifsc: '3456',
      branch: 'martur',
      pan: '2345',
      aadhar: ''
    },
    items: [
      { desc: 'Brand consultation', qty: 1, total: 100 }
    ],
    contact: {
      email: 'vamsu@gmial.com',
      phone: '+91 6578',
      address1: '4-108 main road',
      address2: 'martur md, droindula'
    }
  });

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === 'qty' || field === 'total') {
      newItems[index][field] = value === '' ? 0 : parseFloat(value);
    } else {
      newItems[index][field] = value;
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { desc: '', qty: 1, total: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleDownload = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    element.classList.add('pdf-rendering');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`Invoice_${formData.invoiceNo || 'Draft'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      element.classList.remove('pdf-rendering');
    }
  };

  const subtotal = formData.items.reduce((acc, item) => acc + (item.total * (item.qty || 1)), 0);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col lg:flex-row font-sans text-neutral-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        .invoice-paper {
          font-family: 'Outfit', sans-serif;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
        }

        .pdf-rendering {
          box-shadow: none !important;
          border: none !important;
          margin: 0 !important;
          border-radius: 0 !important;
          overflow: hidden !important;
        }

        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; background: white; }
          .no-print { display: none !important; }
          .invoice-paper {
            width: 210mm;
            height: 297mm;
            padding: 10mm !important; /* Tighter padding for print */
          }
        }
      `}</style>

      {/* Sidebar Editor */}
      <div className="w-full lg:w-[400px] bg-white border-r border-neutral-200 h-screen overflow-y-auto p-8 no-print shrink-0 lg:fixed lg:left-0 lg:top-0 z-20 scrollbar-hide">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice Pro</h1>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Builder v3.0</p>
          </div>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-neutral-300 uppercase tracking-widest border-b pb-2">Document Metadata</h3>
            <div className="grid gap-3">
              <input placeholder="Invoice No" value={formData.invoiceNo} onChange={(e) => handleInputChange(null, 'invoiceNo', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Issue Date" value={formData.date} onChange={(e) => handleInputChange(null, 'date', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all" />
                <input placeholder="Due Date" value={formData.dueDate} onChange={(e) => handleInputChange(null, 'dueDate', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-neutral-300 uppercase tracking-widest border-b pb-2">Client Details</h3>
            <div className="space-y-3">
              <input placeholder="Client Name" value={formData.issuedTo.companyName} onChange={(e) => handleInputChange('issuedTo', 'companyName', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none" />
              <input placeholder="Address Line 1" value={formData.issuedTo.addressLine1} onChange={(e) => handleInputChange('issuedTo', 'addressLine1', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none" />
              <input placeholder="Address Line 2" value={formData.issuedTo.addressLine2} onChange={(e) => handleInputChange('issuedTo', 'addressLine2', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none" />
              <input placeholder="Location" value={formData.issuedTo.location} onChange={(e) => handleInputChange('issuedTo', 'location', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="PAN" value={formData.issuedTo.pan} onChange={(e) => handleInputChange('issuedTo', 'pan', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-xs outline-none" />
                <input placeholder="GSTIN" value={formData.issuedTo.gst} onChange={(e) => handleInputChange('issuedTo', 'gst', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-xs outline-none" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-[11px] font-bold text-neutral-300 uppercase tracking-widest">Line Items</h3>
              <button onClick={addItem} className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-neutral-900 transition"><Plus size={14} /></button>
            </div>
            {formData.items.map((item, index) => (
              <div key={index} className="bg-neutral-50/50 border border-neutral-100 p-4 rounded-xl space-y-3 group relative">
                <input placeholder="Item Description" value={item.desc} onChange={(e) => handleItemChange(index, 'desc', e.target.value)} className="w-full bg-transparent font-semibold text-sm outline-none" />
                <div className="flex gap-3">
                  <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} className="w-1/3 bg-white border border-neutral-100 p-2 rounded-lg text-sm outline-none" />
                  <input type="number" placeholder="Price" value={item.total} onChange={(e) => handleItemChange(index, 'total', e.target.value)} className="w-2/3 bg-white border border-neutral-100 p-2 rounded-lg text-sm outline-none" />
                </div>
                {formData.items.length > 1 && (
                  <button onClick={() => removeItem(index)} className="absolute -right-2 -top-2 bg-white border border-neutral-100 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition text-red-500"><Trash2 size={12} /></button>
                )}
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-neutral-300 uppercase tracking-widest border-b pb-2">Payment Info</h3>
            <div className="space-y-3">
              <input placeholder="Account Name" value={formData.payTo.accHolder} onChange={(e) => handleInputChange('payTo', 'accHolder', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none" />
              <input placeholder="Account Number" value={formData.payTo.accNo} onChange={(e) => handleInputChange('payTo', 'accNo', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none font-mono" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="IFSC" value={formData.payTo.ifsc} onChange={(e) => handleInputChange('payTo', 'ifsc', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-xs outline-none" />
                <input placeholder="Branch" value={formData.payTo.branch} onChange={(e) => handleInputChange('payTo', 'branch', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-xs outline-none" />
              </div>
              <input placeholder="Aadhar Card" value={formData.payTo.aadhar} onChange={(e) => handleInputChange('payTo', 'aadhar', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-xs outline-none" />
            </div>
          </section>

          <section className="space-y-4 pb-12">
            <h3 className="text-[11px] font-bold text-neutral-300 uppercase tracking-widest border-b pb-2">Contact Details</h3>
            <div className="space-y-3">
              <input placeholder="Email" value={formData.contact.email} onChange={(e) => handleInputChange('contact', 'email', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none" />
              <input placeholder="Phone" value={formData.contact.phone} onChange={(e) => handleInputChange('contact', 'phone', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none" />
              <input placeholder="Address Line 1" value={formData.contact.address1} onChange={(e) => handleInputChange('contact', 'address1', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none" />
              <input placeholder="Address Line 2" value={formData.contact.address2} onChange={(e) => handleInputChange('contact', 'address2', e.target.value)} className="w-full bg-neutral-50 border border-neutral-100 p-3 rounded-xl text-sm outline-none" />
            </div>
          </section>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 lg:ml-[400px] p-8 flex flex-col items-center min-h-screen">
        <div className="w-full max-w-[210mm] flex justify-end gap-4 mb-6 no-print">
          <button className="flex items-center gap-2 px-6 py-2 text-neutral-400 font-bold text-xs uppercase tracking-widest hover:text-neutral-900 transition-colors" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-900 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            <Download size={14} /> Download PDF
          </button>
        </div>

        {/* Invoice Canvas */}
        <div 
          ref={invoiceRef}
          className="invoice-paper w-[210mm] h-[297mm] bg-white p-[15mm] shadow-[0_30px_80px_rgba(0,0,0,0.05)] border border-neutral-100 flex flex-col text-neutral-900 overflow-hidden relative"
        >
          {/* Header Title Layer */}
          <div className="flex justify-between items-end mb-8 border-b-2 border-neutral-900 pb-2">
            <h1 className="text-4xl font-black tracking-tighter text-neutral-900">INVOICE</h1>
            <div className="text-right">
              <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.2em] mb-1">Issue Date</p>
              <p className="text-sm font-bold">{formData.date}</p>
            </div>
          </div>

          <div className="flex justify-between items-start mb-10">
            <div className="w-1/2">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-neutral-300 mb-3">CLIENT INFO</h4>
              <div className="space-y-1">
                {formData.issuedTo.companyName && <p className="font-bold text-lg leading-tight mb-2 text-neutral-900 uppercase">{formData.issuedTo.companyName}</p>}
                <div className="text-[12px] text-neutral-500 font-medium space-y-0.5">
                  {formData.issuedTo.addressLine1 && <p>{formData.issuedTo.addressLine1}</p>}
                  {formData.issuedTo.addressLine2 && <p>{formData.issuedTo.addressLine2}</p>}
                  {formData.issuedTo.location && <p className="text-neutral-400 pt-1">{formData.issuedTo.location}</p>}
                </div>
                <div className="pt-4 grid grid-cols-2 gap-4">
                  {formData.issuedTo.pan && <div><span className="text-[8px] font-black text-neutral-200 uppercase block">PAN</span><span className="text-[10px] font-bold text-neutral-800">{formData.issuedTo.pan}</span></div>}
                  {formData.issuedTo.gst && <div><span className="text-[8px] font-black text-neutral-200 uppercase block">GST</span><span className="text-[10px] font-bold text-neutral-800">{formData.issuedTo.gst}</span></div>}
                </div>
              </div>
            </div>

            <div className="w-1/3 text-right">
              <div className="space-y-4 text-[11px]">
                <div>
                  <span className="text-neutral-300 font-black uppercase block text-[9px] mb-1 tracking-widest">Document Number</span>
                  <span className="font-black text-neutral-900 text-lg tracking-widest">{formData.invoiceNo}</span>
                </div>
                <div>
                  <span className="text-neutral-300 font-black uppercase block text-[9px] mb-1 tracking-widest">Due Date</span>
                  <span className="font-bold text-neutral-900">{formData.dueDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-neutral-300 mb-4">PAYMENT INSTRUCTIONS</h4>
            <div className="grid grid-cols-3 gap-6 bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
              {formData.payTo.accHolder && <div className="col-span-2"><span className="text-[8px] font-black text-neutral-300 uppercase block mb-1">Account Holder</span><span className="text-[12px] font-bold text-neutral-800">{formData.payTo.accHolder}</span></div>}
              {formData.payTo.accNo && <div className="col-span-1"><span className="text-[8px] font-black text-neutral-300 uppercase block mb-1">Account Number</span><span className="text-[12px] font-bold text-neutral-800 font-mono">{formData.payTo.accNo}</span></div>}
              {formData.payTo.ifsc && <div><span className="text-[8px] font-black text-neutral-300 uppercase block mb-1">IFSC</span><span className="text-[11px] font-bold text-neutral-800">{formData.payTo.ifsc}</span></div>}
              {formData.payTo.branch && <div><span className="text-[8px] font-black text-neutral-300 uppercase block mb-1">Branch</span><span className="text-[11px] font-bold text-neutral-800 uppercase">{formData.payTo.branch}</span></div>}
              {formData.payTo.aadhar && <div className="col-span-1"><span className="text-[8px] font-black text-neutral-300 uppercase block mb-1">Aadhar ID</span><span className="text-[11px] font-bold text-neutral-800 font-mono tracking-widest">{formData.payTo.aadhar}</span></div>}
            </div>
          </div>

          <div className="flex-grow">
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b-2 border-neutral-900">
                  <th className="text-left py-3 text-[9px] font-black text-neutral-300 uppercase tracking-widest">DESCRIPTION</th>
                  <th className="text-center py-3 text-[9px] font-black text-neutral-300 uppercase w-20 tracking-widest">QTY</th>
                  <th className="text-right py-3 text-[9px] font-black text-neutral-300 uppercase w-32 tracking-widest">TOTAL (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-5 text-[14px] font-bold text-neutral-900">{item.desc || 'Service Item'}</td>
                    <td className="py-5 text-center text-sm font-medium text-neutral-400">{item.qty}</td>
                    <td className="py-5 text-right text-[14px] font-black text-neutral-900">₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center py-5 border-t-2 border-neutral-900">
              <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Grand Total Payable</span>
              <span className="text-3xl font-black text-neutral-950">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Locked-to-Bottom Footer */}
          <div className="mt-auto pt-6 border-t border-neutral-100">
             <div className="flex justify-between items-start gap-10">
               <div className="w-1/2">
                 <h6 className="text-[8px] font-black text-neutral-200 uppercase tracking-widest mb-3">Contact Support</h6>
                 <div className="flex flex-col gap-1 text-[11px] text-neutral-500 font-medium">
                   {formData.contact.email && <p>{formData.contact.email}</p>}
                   {formData.contact.phone && <p>{formData.contact.phone}</p>}
                 </div>
               </div>
               <div className="w-1/2 text-right">
                 <h6 className="text-[8px] font-black text-neutral-200 uppercase tracking-widest mb-3">Headquarters</h6>
                 <div className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                   {formData.contact.address1 && <p>{formData.contact.address1}</p>}
                   {formData.contact.address2 && <p className="text-neutral-400">{formData.contact.address2}</p>}
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
