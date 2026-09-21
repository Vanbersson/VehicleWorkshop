CREATE TABLE IF NOT EXISTS tb_address(
id int not null auto_increment,
zip_code varchar(8) not null,
state varchar(2) not null,
city varchar(100) not null,
neighborhood varchar(100) not null,
address varchar(100) not null,
address_complement varchar(100),
primary key(id)
);

CREATE TABLE IF NOT EXISTS tb_permission(
id int not null,
description varchar(255) not null,
menu varchar(100) not null,
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_menu(
id varchar(10) not null,
description varchar(100) not null,
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_brand(
id int not null AUTO_INCREMENT,
status tinyint not null,
name varchar(100) not null,
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_unit_measure(
id int not null AUTO_INCREMENT,
status tinyint not null,
unit_measure varchar(2) not null,
description varchar(100) not null,
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_company(
id int not null AUTO_INCREMENT,
status tinyint not null,
name varchar(255) not null,
fantasia varchar(255),
logo_url varchar(255),
cnpj varchar(14) unique not null,
ie varchar(20),
im varchar(20),
email varchar(100),
cellphone varchar(11),
phone varchar(10),
zip_code varchar(8) not null,
state varchar(2) not null,
city varchar(100) not null,
neighborhood varchar(100) not null,
address varchar(100) not null,
address_number varchar(10) not null,
address_complement varchar(100),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_resale(
company_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
name varchar(255) not null,
fantasia varchar(255),
logo_url varchar(255),
cnpj varchar(14) unique not null,
ie varchar(20),
im varchar(20),
email varchar(100),
cellphone varchar(11),
phone varchar(10),
zip_code varchar(8) not null,
state varchar(2) not null,
city varchar(100) not null,
neighborhood varchar(100) not null,
address varchar(100) not null,
address_number varchar(10) not null,
address_complement varchar(100),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_payment_type(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
description varchar(100),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
primary key(id)
);

CREATE TABLE IF NOT EXISTS tb_user_role(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
description varchar(100) not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_user(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
name varchar(100) not null,
email varchar(100) not null unique,
password varchar(255) not null,
cellphone varchar(11),
limit_discount int,
role_id int not null,
role_desc varchar(100) not null,
role_func tinyint not null,
photo_url varchar(255),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(role_id) REFERENCES tb_user_role(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_user_permission(
company_id int not null,
resale_id int not null,
id binary(16) unique,
user_id int not null,
permission_id int not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(user_id) REFERENCES tb_user(id),
FOREIGN KEY(permission_id) REFERENCES tb_permission(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_user_menu(
company_id int not null,
resale_id int not null,
id binary(16) unique,
user_id int not null,
menu_id varchar(10) not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(user_id) REFERENCES tb_user(id),
FOREIGN KEY(menu_id) REFERENCES tb_menu(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_client_category(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
description varchar(100) not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_client_company (
company_id int not null,
resale_id int not null,
date_register datetime not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
name varchar(255) not null,
fantasia varchar(255),
category_id int not null,
clifor tinyint not null,
fisjur tinyint not null,
cnpj varchar(14),
ie varchar(20),
im varchar(20),
cpf varchar(11),
rg varchar(15),
rg_expedidor varchar(11),
date_birth datetime,
email_home varchar(100),
email_work varchar(100),
ddd_cellphone varchar(2),
cellphone varchar(9),
ddd_phone varchar(2),
phone varchar(8),
zip_code varchar(8) not null,
state varchar(2) not null,
city varchar(100) not null,
neighborhood varchar(100) not null,
address varchar(100) not null,
address_number varchar(10) not null,
address_complement varchar(100),
contact_name varchar(100),
contact_email varchar(100),
contact_ddd_phone varchar(2),
contact_phone varchar(8),
contact_ddd_cellphone varchar(2),
contact_cellphone varchar(9),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(category_id) REFERENCES tb_client_category(id),
primary KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_vehicle_model(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
description varchar(100) not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_vehicle(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
date_register datetime not null,
plate varchar(7) not null,
chassi varchar(17),
year_manufacture varchar(4) not null,
year_model varchar(4) not null,
km_current varchar(20),
color tinyint,
model_id int not null,
owner_id int not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(model_id) REFERENCES tb_vehicle_model(id),
FOREIGN KEY(owner_id) REFERENCES tb_client_company(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_part_group(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
type tinyint not null,
description varchar(100),
brand_id int not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(brand_id) REFERENCES tb_brand(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_part_category(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
description varchar(100),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_part(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
date_register datetime not null,
code varchar(50) not null,
description varchar(100),
unit_measure_id int not null,
price_now numeric(11,3) not null,
price_old numeric(11,3) not null,
price_warranty numeric(11,3) not null,
addition_discount tinyint not null,
brand_id int not null,
group_id int not null,
category_id int not null,
location_pri_area varchar(50),
location_pri_street varchar(2),
location_pri_bookcase varchar(2),
location_pri_shelf varchar(2),
location_pri_position varchar(2),
location_sec_area varchar(50),
location_sec_street varchar(2),
location_sec_bookcase varchar(2),
location_sec_shelf varchar(2),
location_sec_position varchar(2),
photo_url_front varchar(255),
photo_url_verse varchar(255),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(unit_measure_id) REFERENCES tb_unit_measure(id),
FOREIGN KEY(brand_id) REFERENCES tb_brand(id),
FOREIGN KEY(group_id) REFERENCES tb_part_group(id),
FOREIGN KEY(category_id) REFERENCES tb_part_category(id),
primary key(id)
);

CREATE TABLE IF NOT EXISTS tb_part_movimentation(
company_id int not null,
resale_id int not null,
part_id int not null,
date_last_entry datetime,
date_last_exit datetime,
qtd_available numeric(11,3) not null,
qtd_accounting numeric(11,3) not null,
qtd_alocada numeric(11,3) not null,
price_total_inventary numeric(15,3) not null,
price_cost numeric(11,3) not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(part_id) REFERENCES tb_part(id),
constraint pk_part_movimentation primary key(company_id,resale_id,part_id)
);

CREATE TABLE IF NOT EXISTS tb_driver(
company_id int not null,
resale_id int not null,
date_register datetime not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
name varchar(100) not null,
cpf varchar(11) not null,
rg varchar(15) not null,
date_birth datetime not null,
male_female tinyint not null,
cnh_register varchar(11) not null,
cnh_category varchar(10) not null,
cnh_validation datetime not null,
email varchar(100),
ddd_cellphone varchar(2),
cellphone varchar(9),
ddd_phone varchar(2),
phone varchar(8),
zip_code varchar(8) not null,
state varchar(2) not null,
city varchar(100) not null,
neighborhood varchar(100) not null,
address varchar(100) not null,
address_number varchar(10) not null,
address_complement varchar(100),
photo_driver_url varchar(255),
photo_doc1_url varchar(255),
photo_doc2_url varchar(255),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_conf_vehicle_entry_checklist(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
checklist1Enabled tinyint,
checklist1Desc varchar(50),
checklist2Enabled tinyint,
checklist2Desc varchar(50),
checklist3Enabled tinyint,
checklist3Desc varchar(50),
checklist4Enabled tinyint,
checklist4Desc varchar(50),
checklist5Enabled tinyint,
checklist5Desc varchar(50),
checklist6Enabled tinyint,
checklist6Desc varchar(50),
checklist7Enabled tinyint,
checklist7Desc varchar(50),
checklist8Enabled tinyint,
checklist8Desc varchar(50),
checklist9Enabled tinyint,
checklist9Desc varchar(50),
checklist10Enabled tinyint,
checklist10Desc varchar(50),
checklist11Enabled tinyint,
checklist11Desc varchar(50),
checklist12Enabled tinyint,
checklist12Desc varchar(50),
checklist13Enabled tinyint,
checklist13Desc varchar(50),
checklist14Enabled tinyint,
checklist14Desc varchar(50),
checklist15Enabled tinyint,
checklist15Desc varchar(50),
checklist16Enabled tinyint,
checklist16Desc varchar(50),
checklist17Enabled tinyint,
checklist17Desc varchar(50),
checklist18Enabled tinyint,
checklist18Desc varchar(50),
checklist19Enabled tinyint,
checklist19Desc varchar(50),
checklist20Enabled tinyint,
checklist20Desc varchar(50),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_vehicle_entry_checklist(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
checklist1Enabled tinyint,
checklist1Label varchar(50),
checklist1Desc varchar(50),

checklist2Enabled tinyint,
checklist2Label varchar(50),
checklist2Desc varchar(50),

checklist3Enabled tinyint,
checklist3Label varchar(50),
checklist3Desc varchar(50),

checklist4Enabled tinyint,
checklist4Label varchar(50),
checklist4Desc varchar(50),

checklist5Enabled tinyint,
checklist5Label varchar(50),
checklist5Desc varchar(50),

checklist6Enabled tinyint,
checklist6Label varchar(50),
checklist6Desc varchar(50),

checklist7Enabled tinyint,
checklist7Label varchar(50),
checklist7Desc varchar(50),

checklist8Enabled tinyint,
checklist8Label varchar(50),
checklist8Desc varchar(50),

checklist9Enabled tinyint,
checklist9Label varchar(50),
checklist9Desc varchar(50),

checklist10Enabled tinyint,
checklist10Label varchar(50),
checklist10Desc varchar(50),

checklist11Enabled tinyint,
checklist11Label varchar(50),
checklist11Desc varchar(50),

checklist12Enabled tinyint,
checklist12Label varchar(50),
checklist12Desc varchar(50),

checklist13Enabled tinyint,
checklist13Label varchar(50),
checklist13Desc varchar(50),

checklist14Enabled tinyint,
checklist14Label varchar(50),
checklist14Desc varchar(50),

checklist15Enabled tinyint,
checklist15Label varchar(50),
checklist15Desc varchar(50),

checklist16Enabled tinyint,
checklist16Label varchar(50),
checklist16Desc varchar(50),

checklist17Enabled tinyint,
checklist17Label varchar(50),
checklist17Desc varchar(50),

checklist18Enabled tinyint,
checklist18Label varchar(50),
checklist18Desc varchar(50),

checklist19Enabled tinyint,
checklist19Label varchar(50),
checklist19Desc varchar(50),

checklist20Enabled tinyint,
checklist20Label varchar(50),
checklist20Desc varchar(50),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_budget(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
date_generation datetime not null,
date_validation datetime,
date_authorization datetime,
name_responsible varchar(100),
payment_type_id int,
payment_type_desc varchar(100),
attendant_user_id int not null,
attendant_user_name varchar(100),
client_company_id int not null,
client_company_name varchar(100),
client_send_date datetime,
client_approved_date datetime,
information varchar(255),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(payment_type_id) REFERENCES tb_payment_type(id),
FOREIGN KEY(attendant_user_id) REFERENCES tb_user(id),
FOREIGN KEY(client_company_id) REFERENCES tb_client_company(id),
primary key(id)
);

CREATE TABLE IF NOT EXISTS tb_vehicle_entry(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
step_entry tinyint not null,

budget_id int,

entry_user_id int not null,
entry_user_name varchar(100) not null,
entry_date datetime not null,
entry_photo1_url varchar(255),
entry_photo2_url varchar(255),
entry_photo3_url varchar(255),
entry_photo4_url varchar(255),
entry_information varchar(255),

exit_date_prevision datetime,

exit_user_id int,
exit_user_name varchar(100),
exit_date datetime,
exit_photo1_url varchar(255),
exit_photo2_url varchar(255),
exit_photo3_url varchar(255),
exit_photo4_url varchar(255),
exit_information varchar(255),

attendant_user_id int,
attendant_user_name varchar(100),
attendant_photo1_url varchar(255),
attendant_photo2_url varchar(255),
attendant_photo3_url varchar(255),
attendant_photo4_url varchar(255),
attendant_information varchar(255),

auth_exit_status tinyint not null,

auth1_exit_user_id int,
auth1_exit_user_name varchar(100),
auth1_exit_date datetime,

auth2_exit_user_id int,
auth2_exit_user_name varchar(100),
auth2_exit_date datetime,

model_id int,
model_description varchar(100),

client_company_id int,
client_company_name varchar(255),

driver_entry_id int,
driver_entry_name varchar(255) not null,

driver_exit_id int,
driver_exit_name varchar(255),

vehicle_plate varchar(7),
vehicle_plate_together varchar(100),
vehicle_fleet varchar(10),
vehicle_color tinyint,
vehicle_km_entry varchar(10),
vehicle_km_exit varchar(10),
vehicle_new tinyint not null,
vehicle_service_order tinyint not null,

num_service_order varchar(20),
num_nfe varchar(20),
num_nfse varchar(20),

checklist_id int,

FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(budget_id) REFERENCES tb_budget(id),
FOREIGN KEY(entry_user_id) REFERENCES tb_user(id),
FOREIGN KEY(exit_user_id) REFERENCES tb_user(id),
FOREIGN KEY(attendant_user_id) REFERENCES tb_user(id),
FOREIGN KEY(auth1_exit_user_id) REFERENCES tb_user(id),
FOREIGN KEY(auth2_exit_user_id) REFERENCES tb_user(id),
FOREIGN KEY(model_id) REFERENCES tb_vehicle_model(id),
FOREIGN KEY(client_company_id) REFERENCES tb_client_company(id),
FOREIGN KEY(driver_entry_id) REFERENCES tb_driver(id),
FOREIGN KEY(driver_exit_id) REFERENCES tb_driver(id),
FOREIGN KEY(checklist_id) REFERENCES tb_vehicle_entry_checklist(id),
PRIMARY KEY(id)
);


CREATE TABLE IF NOT EXISTS tb_purchase_order(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
type tinyint not null,
generation_user_id int not null,
generation_user_name varchar(100) not null,
generation_date datetime not null,
responsible_user_id int not null,
responsible_user_name varchar(100) not null,
payment_type_id int not null,
payment_type_desc varchar(100) not null,
date_delivery datetime not null,
date_received datetime,
information varchar(255),
client_company_id int not null,
client_company_name varchar(100) not null,
attendant_name varchar(100) not null,
attendant_email varchar(100),
attendant_ddd_cellphone varchar(2),
attendant_cellphone varchar(9),
attendant_ddd_phone varchar(2),
attendant_phone varchar(8),
nf_num int,
nf_serie varchar(5),
nf_date datetime,
nf_key varchar(44),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(generation_user_id) REFERENCES tb_user(id),
FOREIGN KEY(responsible_user_id) REFERENCES tb_user(id),
FOREIGN KEY(payment_type_id) REFERENCES tb_payment_type(id),
FOREIGN KEY(client_company_id) REFERENCES tb_client_company(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_purchase_order_item(
company_id int not null,
resale_id int not null,
purchase_id int not null,
item_order int not null,
item_id int not null,
item_code varchar(20) not null,
item_description varchar(100) not null,
quantity numeric(11,3) not null,
discount numeric(11,3) not null,
price numeric(11,3) not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(purchase_id) REFERENCES tb_purchase_order(id),
FOREIGN KEY(item_id) REFERENCES tb_part(id),
CONSTRAINT pk_purchase_order_item PRIMARY KEY(company_id,resale_id,purchase_id,item_id)
);

CREATE TABLE IF NOT EXISTS tb_purchase_order_item_consumption(
company_id int not null,
resale_id int not null,
id binary(16) unique not null,
purchase_id int not null,
item_order int not null,
item_description varchar(100) not null,
quantity numeric(11,3) not null,
discount numeric(11,3) not null,
price numeric(11,3) not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(purchase_id) REFERENCES tb_purchase_order(id),
PRIMARY KEY(id)
);



## workshop

CREATE TABLE IF NOT EXISTS tb_mechanic_department(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
description varchar(100) not null,
PRIMARY KEY(id),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id)
);

CREATE TABLE IF NOT EXISTS tb_mechanic(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
name varchar(100) not null,
code_password int not null,
department_id int not null,
photo_url varchar(255) not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(department_id) REFERENCES tb_mechanic_department(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_notification(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
orig_user_id int not null,
orig_user_name varchar(100) not null,
orig_date datetime not null,
orig_role_id int not null,
orig_role_desc varchar(100) not null,
orig_notification_menu tinyint not null,
orig_id varchar(100) not null,
header varchar(100) not null,
message1 varchar(100) not null,
message2 varchar(100),
message3 varchar(100),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(orig_user_id) REFERENCES tb_user(id),
FOREIGN KEY(orig_role_id) REFERENCES tb_user_role(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_notification_user(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
notification_id int not null,
user_id int not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(notification_id) REFERENCES tb_notification(id),
FOREIGN KEY(user_id) REFERENCES tb_user(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_tool_control_category(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
type tinyint not null,
quantity_req int not null,
description varchar(100) not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_tool_control_material(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
type tinyint not null,
number_ca int,
description varchar(100) not null,
category_id int not null,
quantity_accounting_loan numeric(11,2) not null,
quantity_available_loan numeric(11,2) not null,
quantity_accounting_kit numeric(11,2) not null,
quantity_available_kit numeric(11,2) not null,
validity_day int,
photo_url varchar(255),
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(category_id) REFERENCES tb_tool_control_category(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_tool_control_request(
company_id int not null,
resale_id int not null,
id int not null AUTO_INCREMENT,
status tinyint not null,
request_type tinyint not null,
request_date datetime not null,
request_information varchar(255),
request_user_id int not null,
request_user_name varchar(100) not null,
category_type tinyint not null,
mechanic_id int not null,
FOREIGN KEY(request_user_id) REFERENCES tb_user(id),
FOREIGN KEY(mechanic_id) REFERENCES tb_mechanic(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_tool_control_mat_mec(
company_id int not null,
resale_id int not null,
id binary(16) unique not null,
request_id int not null,
delivery_user_id int,
delivery_user_name varchar(100),
delivery_date datetime not null,
delivery_quantity numeric(11,2) not null,
delivery_information varchar(255),
return_user_id int,
return_user_name varchar(100),
return_date datetime,
return_quantity numeric(11,2),
return_information varchar(255),
material_id int not null,
material_description varchar(100),
material_number_ca int,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(request_id) REFERENCES tb_tool_control_request(id),
FOREIGN KEY(delivery_user_id) REFERENCES tb_user(id),
FOREIGN KEY(return_user_id) REFERENCES tb_user(id),
FOREIGN KEY(material_id) REFERENCES tb_tool_control_material(id),
PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS tb_tool_control_kit_mec(
company_id int not null,
resale_id int not null,
id binary(16) unique not null,
request_id int not null,
quantity_req numeric(11,2) not null,
quantity_ret numeric(11,2),
user_id_ret int,
date_ret datetime,
information_ret varchar(255),
material_id int not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(user_id_ret) REFERENCES tb_user(id),
FOREIGN KEY(request_id) REFERENCES tb_tool_control_request(id),
FOREIGN KEY(material_id) REFERENCES tb_tool_control_material(id),
PRIMARY KEY(id)
);





#Falta verificar
CREATE TABLE IF NOT EXISTS tb_nf_capa(
company_id int not null,
resale_id int not null,
status tinyint not null,
nf_number numeric(12,0) not null,
nf_serie varchar(10) not null,
type_transaction varchar(3) not null,
nf_number_counter int not null,
nf_key varchar(44),
nf_date_emission datetime not null,
nf_date_entry datetime not null,
client_id int not null,
constraint pk_nf_capa primary key(company_id,resale_id,nf_number,nf_serie,type_transaction,nf_number_counter)
);

CREATE TABLE IF NOT EXISTS tb_nf_item(
company_id int not null,
resale_id int not null,
nf_number numeric(12,0) not null,
nf_serie varchar(10) not null,
type_transaction varchar(3) not null,
nf_number_counter int not null,
nf_number_order int not null,
part_id int not null,
quantity numeric(10,2) not null,
constraint pk_nf_item primary key(company_id,resale_id,nf_number,nf_serie,type_transaction,nf_number_counter,nf_number_order)
);

CREATE TABLE IF NOT EXISTS tb_budget_requisition(
company_id int not null,
resale_id int not null,
id binary(16) unique,
budget_id int not null,
ordem int not null,
description varchar(100) not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(budget_id) REFERENCES tb_budget(id),
primary key(id)
);

CREATE TABLE IF NOT EXISTS tb_budget_item(
company_id int not null,
resale_id int not null,
id binary(16) unique,
status tinyint not null,
budget_id int not null,
ordem int not null,
part_id int not null,
code varchar(20) not null,
description varchar(100) not null,
quantity float not null,
discount float not null,
price float not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(part_id) REFERENCES tb_part(id),
FOREIGN KEY(budget_id) REFERENCES tb_budget(id),
primary key(id)
);

CREATE TABLE IF NOT EXISTS tb_budget_service(
company_id int not null,
resale_id int not null,
id binary(16) unique,
budget_id int not null,
status tinyint not null,
ordem int not null,
description varchar(100) not null,
hour_service float not null,
price float not null,
discount float not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
FOREIGN KEY(budget_id) REFERENCES tb_budget(id),
primary key(id)
);

CREATE TABLE IF NOT EXISTS tb_budget_token(
company_id int not null,
resale_id int not null,
id binary(16) unique,
budget_id int not null,
date_valid datetime not null,
FOREIGN KEY(company_id) REFERENCES tb_company(id),
FOREIGN KEY(resale_id) REFERENCES tb_resale(id),
PRIMARY KEY(id)
);













