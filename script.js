class List {
    constructor(contents,done){
        this.contents=contents;
        this.done=done;
    }
   toggle(){
       this.done=!this.done;
   } 
}

class ListManager{
    constructor(list=[]){
        this._list=[];
        list.forEach(item=>{
            this.addList(item.contents,item.done);            
        });
    }
    
    addList(contents,done=false){
        const newList=new List(contents,done);
        this._list.push(newList);
        return newList;
    }
    
    getList(){
        return this._list;
    }
    
    getleftListCount(){
        return this._list.reduce((p,c)=>{
            if(c.done===false){
                return++p;
            }else{
                return p;
            }
        },0);
    }
}

class ListManagerWithStorage extends ListManager{
    static get STORAGE_KEY(){
        return "G5WORD-APP";
    }
    
    constructor(){
        const listJSON=localStorage.getItem(ListManagerWithStorage.STORAGE_KEY);
        const item=(listJSON)?JSON.parse(listJSON):[];
        super(item)
    }
    
    addList(contents,done=false){
        const newList=super.addList(contents,done);
        const original=newList.toggle;
        newList.toggle=()=>{
            original.apply(newList);
            this.saveToLocalStorage();
        }
        this.saveToLocalStorage();
        return newList;
    }
    
    removeList(index){
       this._list.splice(index,1); 
       this.saveToLocalStorage();
    }
    
    saveToLocalStorage(){
        const listJSON=JSON.stringify(this._list);
        localStorage.setItem(
        ListManagerWithStorage.STORAGE_KEY, listJSON);
    }
}

class ListApp{
    constructor(item){
        this.listManager= new ListManagerWithStorage(item);
        this.listContainerEl=document.querySelector(".list-container");
        this.titleEl=document.querySelector(".title h2");
        this.plusBtnEl=document.querySelector(".add-list button");
        this.plusInputEl=document.querySelector(".add-list input");
        this.playAll=document.querySelector(".play-all")
        this.renderItem();this.bindEvents();
    }

    renderItem(){
        const _this = this; 
        this.listContainerEl.innerHTML='';

        this.listManager.getList().forEach((list,i)=>{
            const listEl=this.createListEl(list,i);
            this.listContainerEl.appendChild(listEl);
           listEl.querySelector('.play').addEventListener("click",function(){          
                var text =  listEl.querySelector("label").textContent;
				var speaker = "Thomas"; 
                var synth = window.speechSynthesis;
                var utterThis = new SpeechSynthesisUtterance(text);

                utterThis.voice = synth.getVoices().filter(function(voice) { 
					return voice.name == speaker; 
				})[0];
                synth.speak(utterThis);
            })
            listEl.querySelector('.remove').addEventListener("click",function(){
                var child = listEl;
                var parent = child.parentNode;
                var index = Array.prototype.indexOf.call(parent.children, child);
                _this.listManager.removeList(index);
                parent.removeChild(child);
            })
        });
     
    }
    
    createListEl(list,id){
        const listEl=document.createElement("div");
        listEl.id="list-"+id;
        listEl.className="list";
        listEl.innerHTML=
            `<div class="item list-group-item list-group-item-action"><input type="checkbox"${list.done?"checked":""}><label>${list.contents}</label><span class="float-end button-group"><button class="play btn btn-sm btn-outline-primary">play</button><button class="remove btn btn-sm btn-outline-secondary">x</button></span></div>`;

        return listEl;
    }
    
    handleAddItem(){
         var textEl=document.querySelector('.add-list input[type="text"]');
         if(textEl.value==''){
             alert('단어를 먼저 입력해주세요')
         }else{
             this.listManager.addList(textEl.value);
             textEl.value='';
             this.renderItem();
         }   
    }
    
    bindEvents(){
        this.plusBtnEl.addEventListener('click',evt=>{
            this.handleAddItem();
        });
        
        this.plusInputEl.addEventListener('keyup',evt=>{
            if( evt.keyCode === 13) {
               this.handleAddItem();   
            }
        })
        
        this.listContainerEl.addEventListener('click',evt=>{
            if(evt.target.nodeName ==='INPUT' && evt.target.parentElement.className ==='list'){
            const clickedEl=evt.target.parentElement,
                      index=clickedEl.id.replace('list-','');
            this.listManager.getList()[index].toggle();
           }
         });
       
       this.playAll.addEventListener('click',evt=>{
          
           var list = this.listManager.getList();
           var text =  '';
           
           list.forEach(item=>{
               text += item.contents;
               text += '...';
           })
           
		   var speaker = "Thomas"; 
           var synth = window.speechSynthesis;
           var voices = synth.getVoices();
           var utterThis = new SpeechSynthesisUtterance(text);
           utterThis.voice = synth.getVoices().filter(function(voice) { 
		       return voice.name == speaker; 
		   })[0];
           synth.speak(utterThis);
       })
       
       
    }
}



function init(){
    const listApp=new ListApp();
}

speechSynthesis.onvoiceschanged = init();