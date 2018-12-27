import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Row,
  Col,
  Input,
  Form,
  Button,
  message
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { getPageQuery } from '../../../utils/utils';
import styles from './index.less';

@connect(({ royalty,loading }) => ({
  royalty,
  loading: loading.effects['royalty/get'],
}))
@Form.create()
export default class Royalty extends React.Component {
  state = {
    data:{},
    rules:[],//初始数组
    editable:false,//控制文本与输入框
    updateTime:'',
    editArr:[],//编辑数组
  };

  componentDidMount () {
    const {dispatch} = this.props;
    dispatch({
        type: 'royalty/get',
        payload: {},
        callback: (res) => {
            // console.log(res)
            this.setState({
                data: res,
                updateTime: res.updateTime,
                rules:res.rules
            });
        }
    })
    
  }
  //点击设置
  toggleEditable = () => {
    const { rules } = this.state
    const copy = rules.map(item => Object.assign({}, item))
    this.setState({
        editable:true,
        editArr:copy
    });
  }
  //点击取消
  hidden = () => {
    this.setState({
        editable:false
    });
    var span1 = document.querySelector('#cert');
    var span2 = document.querySelector('#activate');
    var span3 = document.querySelector('#activate_cond');
    span1.style.display = 'none'
    span2.style.display = 'none'
    span3.style.display = 'none'
  }
  //失去焦点触发
  inputOnBlur = (item,e)=>{
    const { type } = item
    const { value } = e.target
    let span = e.target.parentNode.lastChild
    let input = e.target
    if(/^([0-9]\d{0,3}|10000)$/.test(value)){
        span.style.display = 'none'
        input.style.borderColor = ''
    }else if(value===''){
        span.style.display = 'none'
        input.style.borderColor = ''   
    }else{
        switch(type){
            case 'cert' :  
            span.style.display = 'block'
            input.style.borderColor = 'red'
            break;
            case 'activate' : 
            span.style.display = 'block'
            input.style.borderColor = 'red'
            break;
            case 'activate_cond' :  
            span.style.display = 'block'
            input.style.borderColor = 'red'
            break;
        }
    }
   
  }
  //输入框触发
  handleInputChange = (item,e) => {
    // console.log(item, e.target.value)
    const { type } = item
    let { value } = e.target
    const { editArr } = this.state
    const obj = editArr.find(item => item.type === type)
    if(/^([1-9]\d{0,3}|10000)$/.test(value)){
        obj.value = (type==='activate_cond') ? value : (value*100)
        this.setState({
            editArr
        })
    }else if(value==='0'||value===''){
        obj.value = 0
        this.setState({
            editArr
        })
    }else{
        switch(type){
            case 'cert' :  
            obj.value = (/.*\..*/.test(value)) ? value : value*100
            this.setState({
                editArr
            })
            break;
            case 'activate' : 
            obj.value = (/.*\..*/.test(value)) ? value : value*100
            this.setState({
                editArr
            })
            break;
            case 'activate_cond' :  
            obj.value = (/.*\..*/.test(value)) ? value : value*100
            this.setState({
                editArr
            })
            break;
        }
        
    }
  }

  //点击保存
  send = () => {
    const {editArr} = this.state;
    const {dispatch} = this.props; 
    const payload = {};
    //判断格式正确性
    const obj = editArr.find(item=>{
        return  (/.*\..*/.test(item.value)||item.value>1000000)
    })

    if(obj){
        if(obj.type){
            switch(obj.type){
                case 'cert' : 
                message.error('认证医生提成必须是0-10000整数');
                break;
                case 'activate' : 
                message.error('激活医生提成必须是0-10000整数');
                break;
                case 'activate_cond' :  
                message.error('激活医生条件必须是0-10000整数');
                break;
            }
        }
    }else{
        let obj1 = editArr.find(item=>{
            return  (isNaN(item.value))
        })
        if(obj1){
            if(obj1.type){
                switch(obj1.type){
                    case 'cert' : 
                    message.error('认证医生提成必须是0-10000整数');
                    break;
                    case 'activate' : 
                    message.error('激活医生提成必须是0-10000整数');
                    break;
                    case 'activate_cond' :  
                    message.error('激活医生条件必须是0-10000整数');
                    break;
                }
            }
        }else{
            this.setState({
                rules:editArr,
                editable:false
            })
            console.log('编辑',editArr)
            
            payload.rules = editArr;
            dispatch({
                type: 'royalty/set',
                payload,
                callback: (res) => {
                    console.log(res);
                    if(res.ret===1||res.ret===2){
                        message.success('设置已保存'); 
                    }else if(res.ret===0){
                        message.error('操作失败！');
                    }else if(res.status>=500){
                        message.error(res.msg);
                    }
                }
            });
        }
        


    }


  }
   
  render() {
    const { rules } = this.state;
    rules || (rules = [])
    return (
      <PageHeaderWrapper title="提成设置">
            <Card bordered={false}>
                <div className={styles.tableList}>
                    {rules.map(item => {
                        return (
                            <Row key={item.type} style={{margin:'20px'}} className={item.type==='cert'?styles.bot:''}>
                                <Col span={8} style={{float:'left',width:'50%',margin:0}}>
                                    <h3>{item.title}</h3>
                                    <p>{item.content}</p>
                                </Col>
                                <Col span={8} offset={8} style={{display:'inline',float:'right',marginLeft:0,height:'60px'}}>
                                    {<div style={{overflow:'hidden',paddingRight:'13px'}}>
                                        {item.type==='activate_cond' ? (<span style={{float:'right',fontWeight:'bold'}}>人</span>) : (<span style={{float:'right',fontWeight:'bold'}}>元</span>)}
                                        {
                                            this.state.editable ? 
                                            (<Input
                                            defaultValue={item.type==='activate_cond'? item.value : (item.value/100)}
                                            // id={item.type}
                                            autoFocus
                                            onChange={e => this.handleInputChange(item,e)}
                                            onBlur={e => this.inputOnBlur(item,e) }
                                            style={{width:'18%',float:'right'}}
                                            />) : <span style={{float:'right',textAlign:'center'}}>{item.type==='activate_cond'? (item.value) : (item.value/100)}</span>
                                            
                                        }
                                        {<span id={item.type} style={{position:'absolute',right:0,bottom:0,color:'red',display:'none'}}>{item.title}必须是0-10000整数</span>}
                                    </div>}
                                </Col>
                             </Row>
                        )
                    })}  
                </div>
                <div style={{position: 'relative', zIndex: 1,height:'200px'}}>
                    <a  style={{position: 'absolute', left: 0, bottom: 10 ? 20 : -25}}>
                        {this.state.editable ? (
                            <span className={styles.submitButtons}>
                                <Button type="primary" htmlType="submit" onClick={()=>{this.send()}}>
                                    保存
                                </Button>
                                <Button type="defalut" style={{marginLeft:'20px'}} onClick={()=>{this.hidden()}}>
                                    取消
                                </Button>
                            </span>
                        ) : (
                            <span className={styles.submitButtons}>
                                <Button type="primary" htmlType="submit" onClick={()=>{this.toggleEditable()}}>
                                    设置
                                </Button>
                            </span>
                        )}
                    </a>
                </div>
            </Card>
      </PageHeaderWrapper>
    )
  }
}

